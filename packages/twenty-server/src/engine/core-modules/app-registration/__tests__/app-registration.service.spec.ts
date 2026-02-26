import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { AppRegistrationVariableEntity } from 'src/engine/core-modules/app-registration/app-registration-variable.entity';
import { AppRegistrationEncryptionService } from 'src/engine/core-modules/app-registration/app-registration-encryption.service';
import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';
import { AppRegistrationExceptionCode } from 'src/engine/core-modules/app-registration/app-registration.exception';
import { AppRegistrationService } from 'src/engine/core-modules/app-registration/app-registration.service';

describe('AppRegistrationService', () => {
  let service: AppRegistrationService;
  let appRegistrationRepository: jest.Mocked<
    Repository<AppRegistrationEntity>
  >;
  let variableRepository: jest.Mocked<
    Repository<AppRegistrationVariableEntity>
  >;
  let encryptionService: jest.Mocked<AppRegistrationEncryptionService>;

  const mockUserId = 'user-123';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppRegistrationService,
        {
          provide: getRepositoryToken(AppRegistrationEntity),
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
          provide: getRepositoryToken(AppRegistrationVariableEntity),
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
          provide: AppRegistrationEncryptionService,
          useValue: {
            encrypt: jest.fn((value: string) => `enc_${value}`),
            decrypt: jest.fn((value: string) =>
              value.replace('enc_', ''),
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AppRegistrationService);
    appRegistrationRepository = module.get(
      getRepositoryToken(AppRegistrationEntity),
    );
    variableRepository = module.get(
      getRepositoryToken(AppRegistrationVariableEntity),
    );
    encryptionService = module.get(AppRegistrationEncryptionService);
  });

  describe('create', () => {
    it('should always generate a client secret', async () => {
      appRegistrationRepository.findOne.mockResolvedValue(null);
      appRegistrationRepository.create.mockImplementation(
        (entity) =>
          ({
            ...entity,
            id: 'reg-1',
          }) as AppRegistrationEntity,
      );
      appRegistrationRepository.save.mockImplementation(
        async (entity) => entity as AppRegistrationEntity,
      );

      const result = await service.create(
        { name: 'Test App' },
        mockUserId,
      );

      expect(result.appRegistration.name).toBe('Test App');
      expect(result.clientSecret).toBeDefined();
      expect(result.clientSecret.length).toBeGreaterThan(0);
      expect(appRegistrationRepository.save).toHaveBeenCalled();
    });

    it('should accept null createdByUserId for CLI-created registrations', async () => {
      appRegistrationRepository.findOne.mockResolvedValue(null);
      appRegistrationRepository.create.mockImplementation(
        (entity) =>
          ({
            ...entity,
            id: 'reg-1',
          }) as AppRegistrationEntity,
      );
      appRegistrationRepository.save.mockImplementation(
        async (entity) => entity as AppRegistrationEntity,
      );

      const result = await service.create({ name: 'CLI App' }, null);

      expect(result.appRegistration.createdByUserId).toBeNull();
    });

    it('should reject duplicate universal identifiers', async () => {
      appRegistrationRepository.findOne.mockResolvedValue({
        id: 'existing',
      } as AppRegistrationEntity);

      await expect(
        service.create(
          {
            name: 'Dupe App',
            universalIdentifier: 'existing-uid',
          },
          mockUserId,
        ),
      ).rejects.toMatchObject({
        code: AppRegistrationExceptionCode.UNIVERSAL_IDENTIFIER_ALREADY_CLAIMED,
      });
    });

    it('should reject invalid scopes', async () => {
      appRegistrationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: 'Bad Scopes App',
            scopes: ['api', 'invalid:scope'],
          },
          mockUserId,
        ),
      ).rejects.toMatchObject({
        code: AppRegistrationExceptionCode.INVALID_SCOPE,
      });
    });
  });

  describe('delete', () => {
    it('should soft delete a registration', async () => {
      appRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as AppRegistrationEntity);

      const result = await service.delete('reg-1');

      expect(result).toBe(true);
      expect(appRegistrationRepository.softDelete).toHaveBeenCalledWith(
        'reg-1',
      );
    });
  });

  describe('rotateClientSecret', () => {
    it('should generate a new secret', async () => {
      appRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as AppRegistrationEntity);

      const secret = await service.rotateClientSecret('reg-1');

      expect(secret).toBeDefined();
      expect(secret.length).toBeGreaterThan(0);
      expect(appRegistrationRepository.update).toHaveBeenCalledWith(
        'reg-1',
        expect.objectContaining({ clientSecretHash: expect.any(String) }),
      );
    });
  });

  describe('createVariable', () => {
    it('should encrypt variable value', async () => {
      appRegistrationRepository.findOne.mockResolvedValue({
        id: 'reg-1',
      } as AppRegistrationEntity);

      variableRepository.create.mockImplementation(
        (entity) => entity as AppRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as AppRegistrationVariableEntity,
      );

      await service.createVariable({
        appRegistrationId: 'reg-1',
        key: 'API_KEY',
        value: 'secret-value',
      });

      expect(encryptionService.encrypt).toHaveBeenCalledWith(
        'secret-value',
      );
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
        (entity) => entity as AppRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as AppRegistrationVariableEntity,
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
      } as AppRegistrationVariableEntity);

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
        (entity) => entity as AppRegistrationVariableEntity,
      );
      variableRepository.save.mockImplementation(
        async (entity) => entity as AppRegistrationVariableEntity,
      );

      await service.syncVariableSchemas('reg-1', {
        KEPT_KEY: { description: 'stays' },
      });

      expect(variableRepository.delete).toHaveBeenCalledWith(
        expect.objectContaining({
          appRegistrationId: 'reg-1',
        }),
      );
    });
  });

  describe('findOneByClientId', () => {
    it('should return null when client not found', async () => {
      appRegistrationRepository.findOne.mockResolvedValue(null);

      const result = await service.findOneByClientId('nonexistent');

      expect(result).toBeNull();
    });

    it('should return registration by client ID', async () => {
      const mockRegistration = {
        id: 'reg-1',
        clientId: 'chrome',
      } as AppRegistrationEntity;

      appRegistrationRepository.findOne.mockResolvedValue(
        mockRegistration,
      );

      const result = await service.findOneByClientId('chrome');

      expect(result).toEqual(mockRegistration);
    });
  });
});
