import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { FieldMetadataType } from 'twenty-shared/types';

import { ApplicationVariableEntity } from 'src/engine/core-modules/application/application-variable/application-variable.entity';
import {
  ApplicationVariableEntityException,
  ApplicationVariableEntityExceptionCode,
} from 'src/engine/core-modules/application/application-variable/application-variable.exception';
import { ApplicationVariableEntityService } from 'src/engine/core-modules/application/application-variable/application-variable.service';
import { SECRET_APPLICATION_VARIABLE_MASK } from 'src/engine/core-modules/application/application-variable/constants/secret-application-variable-mask.constant';
import { type ApplicationVariableCacheMaps } from 'src/engine/core-modules/application/application-variable/types/application-variable-cache-maps.type';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type FlatApplicationVariable } from 'src/engine/metadata-modules/flat-application-variable/types/flat-application-variable.type';
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
            decryptVersionedOrThrow: jest.fn(
              (value: string, _opts?: { workspaceId?: string }) =>
                value.replace(/^enc:v2:[0-9a-f]+:/, '').replace(/\|.*$/, ''),
            ),
            maskDecryptedValue: jest.fn(
              (_decryptedValue: string, _mask: string) => '********',
            ),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            invalidateAndRecompute: jest.fn(),
            getOrRecompute: jest.fn(),
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

  const workspaceA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const workspaceB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const makeFlatVariable = (
    overrides: Partial<FlatApplicationVariable>,
  ): FlatApplicationVariable =>
    ({
      id: '1',
      key: 'KEY',
      value: '' as EncryptedString | '',
      description: '',
      isSecret: false,
      type: FieldMetadataType.TEXT,
      options: null,
      applicationId: mockApplicationId,
      workspaceId: workspaceA,
      universalIdentifier: '00000000-0000-0000-0000-000000000000',
      applicationUniversalIdentifier: '00000000-0000-0000-0000-000000000000',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      ...overrides,
    }) as FlatApplicationVariable;

  const makeApplicationVariableMaps = (
    flatApplicationVariables: FlatApplicationVariable[],
  ) =>
    ({
      byUniversalIdentifier: Object.fromEntries(
        flatApplicationVariables.map((flatApplicationVariable) => [
          flatApplicationVariable.universalIdentifier,
          flatApplicationVariable,
        ]),
      ),
      universalIdentifiersByApplicationId: {
        [mockApplicationId]: flatApplicationVariables.map(
          ({ universalIdentifier }) => universalIdentifier,
        ),
      },
    }) as unknown as ApplicationVariableCacheMaps;

  const mockCachedApplicationVariables = (
    flatApplicationVariables: FlatApplicationVariable[],
  ) => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      applicationVariableMaps: makeApplicationVariableMaps(
        flatApplicationVariables,
      ),
    } as never);
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getServerEnvVariables', () => {
    it('should return an empty object when the application has no variable', async () => {
      mockCachedApplicationVariables([]);

      await expect(
        service.getServerEnvVariables({
          workspaceId: workspaceA,
          applicationId: mockApplicationId,
        }),
      ).resolves.toEqual({});
    });

    it('should decrypt all encrypted variables regardless of isSecret', async () => {
      mockCachedApplicationVariables([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'PUBLIC_URL',
          value:
            `enc:v2:deadbeef:https://example.com|${workspaceA}` as EncryptedString,
        }),
        makeFlatVariable({
          universalIdentifier: 'variable-2',
          key: 'API_SECRET',
          value: `enc:v2:deadbeef:secret-123|${workspaceA}` as EncryptedString,
          isSecret: true,
        }),
      ]);

      const result = await service.getServerEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
      });

      expect(result).toEqual({
        PUBLIC_URL: 'https://example.com',
        API_SECRET: 'secret-123',
      });
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledTimes(2);
    });

    it('should still inject a deprecated variable so apps can fall back to it', async () => {
      mockCachedApplicationVariables([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'API_KEY',
          value: `enc:v2:deadbeef:legacy-key|${workspaceA}` as EncryptedString,
          isSecret: true,
          isDeprecated: true,
        }),
        makeFlatVariable({
          universalIdentifier: 'variable-2',
          key: 'NEW_API_KEY',
          value: `enc:v2:deadbeef:new-key|${workspaceA}` as EncryptedString,
          isSecret: true,
        }),
      ]);

      const result = await service.getServerEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
      });

      expect(result).toEqual({
        API_KEY: 'legacy-key',
        NEW_API_KEY: 'new-key',
      });
    });

    it('should route each variable to its own workspace HKDF context', async () => {
      mockCachedApplicationVariables([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'A_SECRET',
          value: `enc:v2:deadbeef:value-a|${workspaceA}` as EncryptedString,
          isSecret: true,
        }),
        makeFlatVariable({
          universalIdentifier: 'variable-2',
          key: 'B_SECRET',
          value: `enc:v2:deadbeef:value-b|${workspaceB}` as EncryptedString,
          isSecret: true,
          workspaceId: workspaceB,
        }),
      ]);

      await service.getServerEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
      });

      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledWith(`enc:v2:deadbeef:value-a|${workspaceA}`, {
        workspaceId: workspaceA,
      });
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledWith(`enc:v2:deadbeef:value-b|${workspaceB}`, {
        workspaceId: workspaceB,
      });
    });

    it('should return an empty string for uninitialised variables without decrypting', async () => {
      mockCachedApplicationVariables([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'EMPTY_VALUE',
          value: '',
        }),
      ]);

      const result = await service.getServerEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
      });

      expect(result).toEqual({ EMPTY_VALUE: '' });
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).not.toHaveBeenCalled();
    });

    it('should reuse provided application variable maps instead of reading the cache', async () => {
      const applicationVariableMaps = makeApplicationVariableMaps([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'PUBLIC_URL',
          value:
            `enc:v2:deadbeef:https://example.com|${workspaceA}` as EncryptedString,
        }),
      ]);

      const result = await service.getServerEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
        applicationVariableMaps,
      });

      expect(result).toEqual({ PUBLIC_URL: 'https://example.com' });
      expect(workspaceCacheService.getOrRecompute).not.toHaveBeenCalled();
    });
  });

  describe('getPublicEnvVariables', () => {
    it('should exclude secret variables without decrypting them', async () => {
      mockCachedApplicationVariables([
        makeFlatVariable({
          universalIdentifier: 'variable-1',
          key: 'PUBLIC_URL',
          value:
            `enc:v2:deadbeef:https://example.com|${workspaceA}` as EncryptedString,
        }),
        makeFlatVariable({
          universalIdentifier: 'variable-2',
          key: 'API_SECRET',
          value: `enc:v2:deadbeef:secret-123|${workspaceA}` as EncryptedString,
          isSecret: true,
        }),
      ]);

      const result = await service.getPublicEnvVariables({
        workspaceId: workspaceA,
        applicationId: mockApplicationId,
      });

      expect(result).toEqual({ PUBLIC_URL: 'https://example.com' });
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledTimes(1);
    });
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
        plainTextValue: 'new-secret-value' as PlaintextString,
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

    it('should encrypt value even when variable is not secret', async () => {
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
        plainTextValue: 'https://new-url.com' as PlaintextString,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encryptVersioned).toHaveBeenCalledWith(
        'https://new-url.com',
        { workspaceId: mockWorkspaceId },
      );
      expect(repository.update).toHaveBeenCalledWith(
        { key: 'PUBLIC_URL', applicationId: mockApplicationId },
        { value: `enc:v2:deadbeef:https://new-url.com|${mockWorkspaceId}` },
      );
    });

    it('should encrypt an empty value like any other value', async () => {
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
        plainTextValue: '' as PlaintextString,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      });

      expect(secretEncryptionService.encryptVersioned).toHaveBeenCalledWith(
        '',
        { workspaceId: mockWorkspaceId },
      );
      expect(repository.update).toHaveBeenCalledWith(
        { key: 'API_KEY', applicationId: mockApplicationId },
        { value: `enc:v2:deadbeef:|${mockWorkspaceId}` },
      );
    });

    it('should throw exception when variable not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          key: 'NON_EXISTENT',
          plainTextValue: 'some-value' as PlaintextString,
          applicationId: mockApplicationId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ApplicationVariableEntityException);

      await expect(
        service.update({
          key: 'NON_EXISTENT',
          plainTextValue: 'some-value' as PlaintextString,
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
      expect(secretEncryptionService.maskDecryptedValue).not.toHaveBeenCalled();
    });

    it('should decrypt once with the row workspaceId and mask the plaintext for secret variables', () => {
      const variable = {
        id: '1',
        key: 'SECRET_KEY',
        value: 'enc:v2:deadbeef:secret|workspace-123',
        isSecret: true,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      } as ApplicationVariableEntity;

      const result = service.getDisplayValue(variable);

      expect(result).toBe('********');
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledTimes(1);
      expect(
        secretEncryptionService.decryptVersionedOrThrow,
      ).toHaveBeenCalledWith('enc:v2:deadbeef:secret|workspace-123', {
        workspaceId: mockWorkspaceId,
      });
      expect(secretEncryptionService.maskDecryptedValue).toHaveBeenCalledWith(
        'secret',
        SECRET_APPLICATION_VARIABLE_MASK,
      );
    });

    it('should return an empty string when a secret variable decrypts to an empty string', () => {
      const variable = {
        id: '1',
        key: 'SECRET_KEY',
        value: `enc:v2:deadbeef:|${mockWorkspaceId}`,
        isSecret: true,
        applicationId: mockApplicationId,
        workspaceId: mockWorkspaceId,
      } as ApplicationVariableEntity;

      const result = service.getDisplayValue(variable);

      expect(result).toBe('');
      expect(secretEncryptionService.maskDecryptedValue).not.toHaveBeenCalled();
    });
  });
});
