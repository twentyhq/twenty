import { type FlatApplicationVariable } from 'src/engine/core-modules/applicationVariable/types/flat-application-variable.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { buildEnvVar } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/build-env-var';

describe('buildEnvVar', () => {
  const mockSecretEncryptionService = {
    encrypt: jest.fn((value: string) => `encrypted_${value}`),
    decrypt: jest.fn((value: string) => value.replace('encrypted_', '')),
  } as unknown as SecretEncryptionService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty object for empty array', () => {
    const result = buildEnvVar([], mockSecretEncryptionService);

    expect(result).toEqual({});
  });

  it('should handle mixed secret and non-secret variables', () => {
    const flatVariables: FlatApplicationVariable[] = [
      {
        id: '1',
        key: 'PUBLIC_URL',
        value: 'https://example.com',
        description: 'Public URL',
        isSecret: false,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        key: 'API_SECRET',
        value: 'encrypted_secret-123',
        description: 'API secret',
        isSecret: true,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '3',
        key: 'DEBUG',
        value: 'true',
        description: 'Debug flag',
        isSecret: false,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    const result = buildEnvVar(flatVariables, mockSecretEncryptionService);

    expect(result).toEqual({
      PUBLIC_URL: 'https://example.com',
      API_SECRET: 'secret-123',
      DEBUG: 'true',
    });
    expect(mockSecretEncryptionService.decrypt).toHaveBeenCalledTimes(1);
    expect(mockSecretEncryptionService.decrypt).toHaveBeenCalledWith(
      'encrypted_secret-123',
    );
  });

  it('should handle null or undefined values', () => {
    const flatVariables: FlatApplicationVariable[] = [
      {
        id: '1',
        key: 'NULL_VALUE',
        value: null as unknown as string,
        description: '',
        isSecret: false,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
      {
        id: '2',
        key: 'UNDEFINED_VALUE',
        value: undefined as unknown as string,
        description: '',
        isSecret: false,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    const result = buildEnvVar(flatVariables, mockSecretEncryptionService);

    expect(result).toEqual({
      NULL_VALUE: '',
      UNDEFINED_VALUE: '',
    });
  });

  it('should convert non-string values to strings', () => {
    const flatVariables: FlatApplicationVariable[] = [
      {
        id: '1',
        key: 'NUMBER_VALUE',
        value: 123 as unknown as string,
        description: '',
        isSecret: false,
        applicationId: 'app-1',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    ];

    const result = buildEnvVar(flatVariables, mockSecretEncryptionService);

    expect(result).toEqual({
      NUMBER_VALUE: '123',
    });
  });
});
