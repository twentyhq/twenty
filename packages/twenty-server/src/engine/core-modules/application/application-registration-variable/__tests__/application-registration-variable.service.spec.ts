import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ServerVariables } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

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
            decryptVersionedOrThrow: jest.fn((value: string) =>
              value.replace(/^enc:v2:[0-9a-f]+:/, ''),
            ),
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
    it('should persist isDeprecated on creation', async () => {
      const serverVariables: ServerVariables = {
        API_KEY: { isDeprecated: true },
      };

      await service.syncVariableSchemas(registrationId, serverVariables);

      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ key: 'API_KEY', isDeprecated: true }),
      );
    });

    it('should drop isRequired when the manifest deprecates a variable', async () => {
      variableRepository.find.mockResolvedValue([
        makeExistingVariable({ isRequired: true }),
      ]);

      await service.syncVariableSchemas(registrationId, {
        API_KEY: { isRequired: true, isDeprecated: true },
      });

      expect(variableRepository.update).toHaveBeenCalledWith(
        'variable-1',
        expect.objectContaining({ isRequired: false, isDeprecated: true }),
      );
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

    it('should report configured when the only unfilled variable is deprecated', async () => {
      mockVariables([
        makeExistingVariable({ isRequired: false, isDeprecated: true }),
      ]);

      const result = await service.isConfiguredBatch([registrationId]);

      expect(result.get(registrationId)).toBe(true);
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
