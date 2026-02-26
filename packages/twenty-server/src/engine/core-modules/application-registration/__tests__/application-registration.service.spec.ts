import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationRegistrationVariableEntity } from 'src/engine/core-modules/application-registration/application-registration-variable.entity';
import { ApplicationRegistrationEncryptionService } from 'src/engine/core-modules/application-registration/application-registration-encryption.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';
import { ApplicationRegistrationExceptionCode } from 'src/engine/core-modules/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application-registration/application-registration.service';

describe('ApplicationRegistrationService', () => {
  let service: ApplicationRegistrationService;
  let applicationRegistrationRepository: jest.Mocked<
    Repository<ApplicationRegistrationEntity>
  >;
  let variableRepository: jest.Mocked<
    Repository<ApplicationRegistrationVariableEntity>
  >;
  let encryptionService: jest.Mocked<ApplicationRegistrationEncryptionService>;

  const mockUserId = 'user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ApplicationRegistrationVariableEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ApplicationRegistrationEncryptionService,
          useValue: {
            encrypt: jest.fn((value: string) => `enc_${value}`),
            decrypt: jest.fn((value: string) => value.replace('enc_', '')),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationRegistrationService);
    applicationRegistrationRepository = module.get(
      getRepositoryToken(ApplicationRegistrationEntity),
    );
    variableRepository = module.get(
      getRepositoryToken(ApplicationRegistrationVariableEntity),
    );
    encryptionService = module.get(ApplicationRegistrationEncryptionService);
  });

  describe('create', () => {
    it('should always generate a client secret', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);
      applicationRegistrationRepository.create.mockImplementation(
        (entity) =>
          ({
            ...entity,
            id: 'reg-1',
          }) as ApplicationRegistrationEntity,
      );
      applicationRegistrationRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationEntity,
      );

      const result = await service.create({ name: 'Test App' }, mockUserId);

      expect(result.applicationRegistration.name).toBe('Test App');
      expect(result.clientSecret).toBeDefined();
      expect(result.clientSecret.length).toBeGreaterThan(0);
      expect(applicationRegistrationRepository.save).toHaveBeenCalled();
    });

    it('should accept null createdByUserId for CLI-created registrations', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);
      applicationRegistrationRepository.create.mockImplementation(
        (entity) =>
          ({
            ...entity,
            id: 'reg-1',
          }) as ApplicationRegistrationEntity,
      );
      applicationRegistrationRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationEntity,
      );

      const result = await service.create({ name: 'CLI App' }, null);

      expect(result.applicationRegistration.createdByUserId).toBeNull();
    });

    it('should reject duplicate universal identifiers', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'existing',
      } as ApplicationRegistrationEntity);

      await expect(
        service.create(
          {
            name: 'Dupe App',
            universalIdentifier: 'existing-uid',
          },
          mockUserId,
        ),
      ).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      });
    });

    it('should reject invalid scopes', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'Bad Scopes App',
            scopes: ['api', 'invalid:scope'],
          },
          mockUserId,
        ),
      ).rejects.toMatchObject({
        code: ApplicationRegistrationExceptionCode.INVALID_SCOPE,
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a registration', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as ApplicationRegistrationEntity);

      const result = await service.delete('reg-1');

      expect(result).toBe(true);
      expect(applicationRegistrationRepository.softDelete).toHaveBeenCalledWith(
        'reg-1',
      );
    });
  });

  describe('rotateClientSecret', () => {
    it('should generate a new secret', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as ApplicationRegistrationEntity);

      const secret = await service.rotateClientSecret('reg-1');

      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
      expect(applicationRegistrationRepository.update).toHaveBeenCalledWith(
        'reg-1',
        expect.objectContaining({ oAuthClientSecretHash: expect.any(String) }),
      );
    });
  });

  describe('createVariable', () => {
    it('should encrypt variable value', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as ApplicationRegistrationEntity);

      variableRepository.create.mockImplementation(
        (entity) => entity as ApplicationRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationVariableEntity,
      );

      await service.createVariable({
        applicationRegistrationId: 'reg-1',
        key: 'API_KEY',
        value: 'secret-value',
      });

      expect(encryptionService.encrypt).toHaveBeenCalledWith('secret-value');
      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          encryptedValue: 'enc_secret-value',
        }),
      );
    });
  });

  describe('syncVariableSchemas', () => {
    it('should create variables for new keys', async () => {
      variableRepository.findOne.mockResolvedValue(null);
      variableRepository.create.mockImplementation(
        (entity) => entity as ApplicationRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationVariableEntity,
      );

      await service.syncVariableSchemas('reg-1', {
        NOTION_CLIENT_ID: {
          description: 'Notion OAuth Client ID',
          isSecret: false,
          isRequired: true,
        },
        NOTION_CLIENT_SECRET: {
          description: 'Notion OAuth Client Secret',
          isSecret: true,
          isRequired: true,
        },
      });

      expect(variableRepository.save).toHaveBeenCalledTimes(2);
      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'NOTION_CLIENT_ID',
          encryptedValue: '',
          isSecret: false,
          isRequired: true,
        }),
      );
      expect(variableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'NOTION_CLIENT_SECRET',
          isSecret: true,
          isRequired: true,
        }),
      );
    });

    it('should update metadata for existing keys without overwriting values', async () => {
      variableRepository.findOne.mockResolvedValue({
        id: 'var-1',
        key: 'API_KEY',
        encryptedValue: 'enc_existing_value',
        isSecret: true,
        isRequired: false,
      } as ApplicationRegistrationVariableEntity);

      await service.syncVariableSchemas('reg-1', {
        API_KEY: {
          description: 'Updated description',
          isSecret: false,
          isRequired: true,
        },
      });

      expect(variableRepository.update).toHaveBeenCalledWith('var-1', {
        description: 'Updated description',
        isSecret: false,
        isRequired: true,
      });
      expect(variableRepository.save).not.toHaveBeenCalled();
    });

    it('should delete variables not in schema', async () => {
      variableRepository.findOne.mockResolvedValue(null);
      variableRepository.create.mockImplementation(
        (entity) => entity as ApplicationRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as ApplicationRegistrationVariableEntity,
      );

      await service.syncVariableSchemas('reg-1', {
        KEPT_KEY: { description: 'stays' },
      });

      expect(variableRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationRegistrationId: 'reg-1',
        }),
      );
    });
  });

  describe('findOneByClientId', () => {
    it('should return null when client not found', async () => {
      applicationRegistrationRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneByClientId('nonexistent');

      expect(result).toBeNull();
    });

    it('should return registration by client ID', async () => {
      const mockRegistration = {
        id: 'reg-1',
        oAuthClientId: 'chrome',
      } as ApplicationRegistrationEntity;

      applicationRegistrationRepository.findOne.mockResolvedValue(
        mockRegistration,
      );

      const result = await service.findOneByClientId('chrome');

      expect(result).toEqual(mockRegistration);
    });
  });
});
