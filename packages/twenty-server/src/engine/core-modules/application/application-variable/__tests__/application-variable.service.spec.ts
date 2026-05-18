import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
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
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: SecretEncryptionService,
          useValue: {
            encryptVersioned: jest.fn(
              (value: string, opts?: { workspaceId?: string }) =>
                `enc:v2:deadbeef:${value}|${opts?.workspaceId ?? 'instance'}`,
            ),
            decryptVersioned: jest.fn(
              (value: string, _opts?: { workspaceId?: string }) =>
                value.replace(/^enc:v2:[0-9a-f]+:/, '').replace(/\|.*$/, ''),
            ),
            decryptAndMaskVersioned: jest.fn(
              ({
                value: _value,
                mask: _mask,
                workspaceId: _workspaceId,
              }: {
                value: string;
                mask: string;
                workspaceId?: string;
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
    it('should encrypt value with workspaceId-scoped envelope when variable is secret', async () => {
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

      expect(secretEncryptionService.encryptVersioned).toHaveBeenCalledWith(
        'new-secret-value',
        { workspaceId: mockWorkspaceId },
      );
      expect(repository.update).toHaveBeenCalledWith(
        { key: 'API_KEY', applicationId: mockApplicationId },
        { value: `enc:v2:deadbeef:new-secret-value|${mockWorkspaceId}` },
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

      expect(secretEncryptionService.encryptVersioned).not.toHaveBeenCalled();
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

  describe('getDisplayValue', () => {
    it('should return plain value for non-secret variables', () => {
      const variable = {
        id: '1',
        key: 'PUBLIC_URL',
        value: 'https://example.com',
        isSecret: false,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      } as ApplicationVariableEntity;

      const result = service.getDisplayValue(variable);

      expect(result).toBe('https://example.com');
      expect(
        secretEncryptionService.decryptAndMaskVersioned,
      ).not.toHaveBeenCalled();
    });

    it('should call decryptAndMaskVersioned with the row workspaceId for secret variables', () => {
      const variable = {
        id: '1',
        key: 'SECRET_KEY',
        value: 'enc:v2:deadbeef:secret|workspace-123',
        isSecret: true,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      } as ApplicationVariableEntity;

      service.getDisplayValue(variable);

      expect(
        secretEncryptionService.decryptAndMaskVersioned,
      ).toHaveBeenCalledWith({
        value: 'enc:v2:deadbeef:secret|workspace-123',
        mask: SECRET_APPLICATION_VARIABLE_MASK,
        workspaceId: mockWorkspaceId,
      });
    });
  });
});
