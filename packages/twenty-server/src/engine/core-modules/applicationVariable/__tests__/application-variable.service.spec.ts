import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/applicationVariable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/applicationVariable/application-variable.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/applicationVariable/constants/secret-application-variable-mask.constant';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('ApplicationVariableEntityService', () => {
  let service: ApplicationVariableEntityService;
  let repository: jest.Mocked<Repository<ApplicationVariableEntity>>;
  let secretEncryptionService: jest.Mocked<SecretEncryptionService>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;

  const mockWorkspaceId = 'workspace-123';
  const mockApplicationId = 'app-456';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationVariableEntityService,
        {
          provide: getRepositoryToken(ApplicationVariableEntity),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SecretEncryptionService,
          useValue: {
            encrypt: jest.fn((value: string) => `encrypted_${value}`),
            decrypt: jest.fn((value: string) =>
              value.replace('encrypted_', ''),
            ),
            decryptAndMask: jest.fn(
              ({
                value: _value,
                mask: _mask,
              }: {
                value: string;
                mask: string;
              }) => '********',
            ),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            invalidateAndRecompute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationVariableEntityService>(
      ApplicationVariableEntityService,
    );
    repository = module.get(getRepositoryToken(ApplicationVariableEntity));
    secretEncryptionService = module.get(SecretEncryptionService);
    workspaceCacheService = module.get(WorkspaceCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('update', () => {
    it('should encrypt value when variable is secret', async () => {
      const existingVariable = {
        id: '1',
        key: 'API_KEY',
        value: 'old-encrypted-value',
        isSecret: true,
        applicationId: mockApplicationId,
      } as ApplicationVariableEntity;

      repository.findOne.mockResolvedValue(existingVariable);
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.update({
        key: 'API_KEY',
        plainTextValue: 'new-secret-value',
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encrypt).toHaveBeenCalledWith(
        'new-secret-value',
      );
      expect(repository.update).toHaveBeenCalledWith(
        { key: 'API_KEY', applicationId: mockApplicationId },
        { value: 'encrypted_new-secret-value' },
      );
      expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
        mockWorkspaceId,
        ['applicationVariableMaps'],
      );
    });

    it('should not encrypt value when variable is not secret', async () => {
      const existingVariable = {
        id: '1',
        key: 'PUBLIC_URL',
        value: 'https://old-url.com',
        isSecret: false,
        applicationId: mockApplicationId,
      } as ApplicationVariableEntity;

      repository.findOne.mockResolvedValue(existingVariable);
      repository.update.mockResolvedValue({ affected: 1 } as any);

      await service.update({
        key: 'PUBLIC_URL',
        plainTextValue: 'https://new-url.com',
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encrypt).not.toHaveBeenCalled();
      expect(repository.update).toHaveBeenCalledWith(
        { key: 'PUBLIC_URL', applicationId: mockApplicationId },
        { value: 'https://new-url.com' },
      );
    });

    it('should throw exception when variable not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          key: 'NON_EXISTENT',
          plainTextValue: 'some-value',
          applicationId: mockApplicationId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ApplicationVariableEntityException);

      await expect(
        service.update({
          key: 'NON_EXISTENT',
          plainTextValue: 'some-value',
          applicationId: mockApplicationId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: ApplicationVariableEntityExceptionCode.APPLICATION_VARIABLE_NOT_FOUND,
      });
    });
  });

  describe('upsertManyApplicationVariableEntities', () => {
    it('should encrypt secret values when creating new variables', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({} as any);
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await service.upsertManyApplicationVariableEntities({
        applicationVariables: {
          SECRET_KEY: {
            universalIdentifier: 'secret-key-123',
            value: 'my-secret',
            description: 'A secret key',
            isSecret: true,
          },
        },
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encrypt).toHaveBeenCalledWith('my-secret');
      expect(repository.save).toHaveBeenCalledWith({
        key: 'SECRET_KEY',
        value: 'encrypted_my-secret',
        description: 'A secret key',
        isSecret: true,
        applicationId: mockApplicationId,
      });
    });

    it('should not encrypt non-secret values when creating new variables', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({} as any);
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await service.upsertManyApplicationVariableEntities({
        applicationVariables: {
          PUBLIC_URL: {
            universalIdentifier: 'public-url-123',
            value: 'https://example.com',
            description: 'Public URL',
            isSecret: false,
          },
        },
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encrypt).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith({
        key: 'PUBLIC_URL',
        value: 'https://example.com',
        description: 'Public URL',
        isSecret: false,
        applicationId: mockApplicationId,
      });
    });

    it('should handle undefined isSecret as false', async () => {
      repository.findOne.mockResolvedValue(null);
      repository.save.mockResolvedValue({} as any);
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await service.upsertManyApplicationVariableEntities({
        applicationVariables: {
          SOME_VAR: {
            universalIdentifier: 'some-var-123',
            value: 'some-value',
            description: 'Some variable',
          },
        },
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encrypt).not.toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isSecret: false,
        }),
      );
    });

    it('should update existing variables without changing values', async () => {
      const existingVariable = {
        id: '1',
        key: 'EXISTING_VAR',
        value: 'existing-encrypted-value',
        isSecret: true,
        applicationId: mockApplicationId,
      } as ApplicationVariableEntity;

      repository.findOne.mockResolvedValue(existingVariable);
      repository.update.mockResolvedValue({ affected: 1 } as any);
      repository.delete.mockResolvedValue({ affected: 0 } as any);

      await service.upsertManyApplicationVariableEntities({
        applicationVariables: {
          EXISTING_VAR: {
            universalIdentifier: 'existing-var-123',
            value: 'new-value',
            description: 'Updated description',
            isSecret: true,
          },
        },
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(repository.update).toHaveBeenCalledWith(
        { key: 'EXISTING_VAR', applicationId: mockApplicationId },
        {
          description: 'Updated description',
          isSecret: true,
          value: 'encrypted_new-value',
        },
      );
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should handle undefined applicationVariables', async () => {
      await service.upsertManyApplicationVariableEntities({
        applicationVariables: undefined,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(repository.findOne).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
      expect(repository.update).not.toHaveBeenCalled();
      expect(
        workspaceCacheService.invalidateAndRecompute,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getDisplayValue', () => {
    it('should return plain value for non-secret variables', () => {
      const variable = {
        id: '1',
        key: 'PUBLIC_URL',
        value: 'https://example.com',
        isSecret: false,
        applicationId: mockApplicationId,
      } as ApplicationVariableEntity;

      const result = service.getDisplayValue(variable);

      expect(result).toBe('https://example.com');
      expect(secretEncryptionService.decryptAndMask).not.toHaveBeenCalled();
    });

    it('should call decryptAndMask for secret variables', () => {
      const variable = {
        id: '1',
        key: 'SECRET_KEY',
        value: 'encrypted_value',
        isSecret: true,
        applicationId: mockApplicationId,
      } as ApplicationVariableEntity;

      service.getDisplayValue(variable);

      expect(secretEncryptionService.decryptAndMask).toHaveBeenCalledWith({
        value: 'encrypted_value',
        mask: SECRET_APPLICATION_VARIABLE_MASK,
      });
    });
  });
});
