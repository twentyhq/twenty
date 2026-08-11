import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Not, type Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.entity';
import { ApplicationRegistrationVariableService } from 'src/engine/core-modules/application/application-registration-variable/application-registration-variable.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';

describe('ApplicationRegistrationVariableService', () => {
  let service: ApplicationRegistrationVariableService;
  let variableRepository: jest.Mocked<
    Repository<ApplicationRegistrationVariableEntity>
  >;
  let applicationRegistrationRepository: jest.Mocked<
    Repository<ApplicationRegistrationEntity>
  >;
  let applicationRepository: jest.Mocked<Repository<ApplicationEntity>>;
  let encryptionService: jest.Mocked<SecretEncryptionService>;

  const registrationId = 'registration-1';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationVariableService,
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
            create: jest.fn((entity) => entity),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: { find: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: SecretEncryptionService,
          useValue: {
            encryptVersioned: jest.fn(
              (value: string) => `enc:v2:deadbeef:${value}`,
            ),
            decryptVersionedOrThrow: jest.fn((value: string) => {
              if (!value.startsWith('enc:v2:deadbeef:')) {
                throw new Error('undecryptable');
              }

              return value.replace(/^enc:v2:[0-9a-f]+:/, '');
            }),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationVariableService);
    variableRepository = module.get(
      getRepositoryToken(ApplicationRegistrationVariableEntity),
    );
    applicationRegistrationRepository = module.get(
      getRepositoryToken(ApplicationRegistrationEntity),
    );
    applicationRepository = module.get(getRepositoryToken(ApplicationEntity));
    encryptionService = module.get(SecretEncryptionService);
  });

  const makeExistingVariable = (
    overrides: Partial<ApplicationRegistrationVariableEntity>,
  ) =>
    ({
      id: 'variable-1',
      key: 'API_KEY',
      encryptedValue: '',
      description: '',
      isSecret: true,
      isRequired: false,
      isDeprecated: false,
      type: FieldMetadataType.TEXT,
      options: null,
      applicationRegistrationId: registrationId,
      ...overrides,
    }) as ApplicationRegistrationVariableEntity;

  describe('syncVariableSchemas', () => {
    it('should default isDeprecated to false when the manifest omits it', async () => {
      const serverVariables: ServerVariables = { API_KEY: {} };

      await service.syncVariableSchemas(registrationId, serverVariables);

      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'API_KEY', isDeprecated: false }),
      );
    });

    it('should persist isDeprecated on creation', async () => {
      const serverVariables: ServerVariables = {
        API_KEY: { isDeprecated: true },
      };

      await service.syncVariableSchemas(registrationId, serverVariables);

      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'API_KEY', isDeprecated: true }),
      );
    });

    it('should update isDeprecated on an existing variable without touching its value', async () => {
      variableRepository.find.mockResolvedValue([
        makeExistingVariable({
          encryptedValue: 'enc:v2:deadbeef:stored-secret' as EncryptedString,
        }),
      ]);

      await service.syncVariableSchemas(registrationId, {
        API_KEY: { isDeprecated: true },
      });

      expect(variableRepository.update).toHaveBeenCalledWith(
        'variable-1',
        expect.objectContaining({ isDeprecated: true }),
      );
      expect(variableRepository.update).toHaveBeenCalledWith(
        'variable-1',
        expect.not.objectContaining({ encryptedValue: expect.anything() }),
      );
      expect(variableRepository.save).not.toHaveBeenCalled();
    });

    it('should un-deprecate a variable when the manifest drops the flag', async () => {
      variableRepository.find.mockResolvedValue([
        makeExistingVariable({ isDeprecated: true }),
      ]);

      await service.syncVariableSchemas(registrationId, { API_KEY: {} });

      expect(variableRepository.update).toHaveBeenCalledWith(
        'variable-1',
        expect.objectContaining({ isDeprecated: false }),
      );
    });

    it('should not delete a deprecated variable that is still declared', async () => {
      variableRepository.find.mockResolvedValue([
        makeExistingVariable({ isDeprecated: true }),
      ]);

      await service.syncVariableSchemas(registrationId, {
        API_KEY: { isDeprecated: true },
        NEW_API_KEY: {},
      });

      expect(variableRepository.delete).toHaveBeenCalledWith({
        applicationRegistrationId: registrationId,
        key: Not(In(['API_KEY', 'NEW_API_KEY'])),
      });
    });
  });

  describe('isConfiguredBatch', () => {
    const mockVariables = (
      variables: ApplicationRegistrationVariableEntity[],
    ) => {
      variableRepository.find.mockResolvedValue(variables);
      applicationRegistrationRepository.find.mockResolvedValue([
        { id: registrationId, manifest: {}, ownerWorkspaceId: null } as never,
      ]);
      applicationRepository.find.mockResolvedValue([]);
    };

    it('should report configured when the only unfilled required variable is deprecated', async () => {
      mockVariables([
        makeExistingVariable({ isRequired: true, isDeprecated: true }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(true);
    });

    it('should report unconfigured when a required variable is not deprecated', async () => {
      mockVariables([
        makeExistingVariable({ isRequired: true, isDeprecated: false }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(false);
    });

    it('should report unconfigured when a required variable decrypts to an empty string', async () => {
      mockVariables([
        makeExistingVariable({
          isRequired: true,
          encryptedValue: 'enc:v2:deadbeef:' as EncryptedString,
        }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(false);
    });

    it('should report configured when a required variable decrypts to a real value', async () => {
      mockVariables([
        makeExistingVariable({
          isRequired: true,
          encryptedValue: 'enc:v2:deadbeef:stored-secret' as EncryptedString,
        }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(true);
    });

    it('should treat an undecryptable required variable as filled', async () => {
      mockVariables([
        makeExistingVariable({
          isRequired: true,
          encryptedValue: 'enc:v2:00000000:rotated-key' as EncryptedString,
        }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(true);
    });
  });

  describe('findVariablesWithObfuscatedValuesGlobal', () => {
    it('should mask an undecryptable non-secret value instead of throwing', async () => {
      variableRepository.find.mockResolvedValue([
        makeExistingVariable({
          isSecret: false,
          encryptedValue: 'enc:v2:00000000:rotated-key' as EncryptedString,
        }),
      ]);

      const [variable] =
        await service.findVariablesWithObfuscatedValuesGlobal(registrationId);

      expect(variable.isFilled).toBe(true);
      expect(variable.value).toBe('•••••••••••••');
    });
  });

  describe('createVariable', () => {
    it('should encrypt an empty value and report the variable unfilled', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: registrationId,
      } as never);
      variableRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationVariableEntity,
      );

      const result = await service.createVariable(
        {
          applicationRegistrationId: registrationId,
          key: 'API_KEY',
          value: '' as PlaintextString,
        },
        'workspace-1',
      );

      expect(encryptionService.encryptVersioned).toHaveBeenCalledWith('');
      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'API_KEY',
          encryptedValue: 'enc:v2:deadbeef:',
        }),
      );
      expect(result.isFilled).toBe(false);
      expect(result.value).toBeNull();
    });
  });

  describe('updateVariableGlobal', () => {
    it('should encrypt an empty value and report the variable unfilled', async () => {
      const variable = makeExistingVariable({
        encryptedValue: 'enc:v2:deadbeef:stored-secret' as EncryptedString,
      });

      variableRepository.findOne.mockResolvedValue(variable);
      variableRepository.findOneOrFail.mockResolvedValue(
        makeExistingVariable({
          encryptedValue: 'enc:v2:deadbeef:' as EncryptedString,
        }),
      );

      const result = await service.updateVariableGlobal({
        id: 'variable-1',
        update: { value: '' as PlaintextString },
      });

      expect(encryptionService.encryptVersioned).toHaveBeenCalledWith('');
      expect(variableRepository.update).toHaveBeenCalledWith('variable-1', {
        encryptedValue: 'enc:v2:deadbeef:',
      });
      expect(result.isFilled).toBe(false);
      expect(result.value).toBeNull();
    });
  });
});
