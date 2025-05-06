import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DeleteResult, IsNull, Repository } from 'typeorm';

import * as authUtils from 'src/engine/core-modules/auth/auth.util';
import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigValueConverterService } from 'src/engine/core-modules/twenty-config/conversion/config-value-converter.service';
import { EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TypedReflect } from 'src/utils/typed-reflect';

jest.mock('src/engine/core-modules/auth/auth.util', () => ({
  encryptText: jest.fn((text) => `encrypted:${text}`),
  decryptText: jest.fn((text) => text.replace('encrypted:', '')),
}));

describe('ConfigStorageService', () => {
  let service: ConfigStorageService;
  let keyValuePairRepository: Repository<KeyValuePair>;
  let configValueConverter: ConfigValueConverterService;
  let environmentConfigDriver: EnvironmentConfigDriver;

  const createMockKeyValuePair = (
    key: string,
    value: string,
  ): KeyValuePair => ({
    id: '1',
    key,
    value: value as unknown as JSON,
    type: KeyValuePairType.CONFIG_VARIABLE,
    userId: null,
    workspaceId: null,
    user: null as unknown as User,
    workspace: null as unknown as Workspace,
    createdAt: new Date(),
    updatedAt: new Date(),
    textValueDeprecated: null,
    deletedAt: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigStorageService,
        {
          provide: ConfigValueConverterService,
          useValue: {
            convertDbValueToAppValue: jest.fn(),
            convertAppValueToDbValue: jest.fn(),
          },
        },
        {
          provide: EnvironmentConfigDriver,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
        ConfigVariables,
        {
          provide: getRepositoryToken(KeyValuePair, 'core'),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            update: jest.fn(),
            insert: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ConfigStorageService>(ConfigStorageService);
    keyValuePairRepository = module.get<Repository<KeyValuePair>>(
      getRepositoryToken(KeyValuePair, 'core'),
    );
    configValueConverter = module.get<ConfigValueConverterService>(
      ConfigValueConverterService,
    );
    environmentConfigDriver = module.get<EnvironmentConfigDriver>(
      EnvironmentConfigDriver,
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return undefined when key not found', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      jest.spyOn(keyValuePairRepository, 'findOne').mockResolvedValue(null);

      const result = await service.get(key);

      expect(result).toBeUndefined();
      expect(keyValuePairRepository.findOne).toHaveBeenCalledWith({
        where: {
          type: KeyValuePairType.CONFIG_VARIABLE,
          key: key as string,
          userId: IsNull(),
          workspaceId: IsNull(),
        },
      });
    });

    it('should return converted value when key found', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const storedValue = 'true';
      const convertedValue = true;

      const mockRecord = createMockKeyValuePair(key as string, storedValue);

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockReturnValue(convertedValue);

      const result = await service.get(key);

      expect(result).toBe(convertedValue);
      expect(
        configValueConverter.convertDbValueToAppValue,
      ).toHaveBeenCalledWith(storedValue, key);
    });

    it('should handle conversion errors', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const error = new Error('Conversion error');

      const mockRecord = createMockKeyValuePair(key as string, 'invalid');

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockImplementation(() => {
        throw error;
      });

      await expect(service.get(key)).rejects.toThrow('Conversion error');
    });

    it('should decrypt sensitive string values', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const originalValue = 'sensitive-value';
      const encryptedValue = 'encrypted:sensitive-value';

      const mockRecord = createMockKeyValuePair(key as string, encryptedValue);

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockReturnValue(encryptedValue);

      const result = await service.get(key);

      expect(result).toBe(originalValue);
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
      expect(authUtils.decryptText).toHaveBeenCalledWith(
        encryptedValue,
        'test-secret',
      );
    });

    it('should handle decryption errors gracefully', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const encryptedValue = 'encrypted-value';
      const convertedValue = 'converted-value';

      const mockRecord = createMockKeyValuePair(key as string, encryptedValue);

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockReturnValue(convertedValue);

      const result = await service.get(key);

      expect(result).toBe(convertedValue);
    });

    it('should handle decryption failure in get() by returning original value', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const encryptedValue = 'encrypted:sensitive-value';

      const mockRecord = createMockKeyValuePair(key as string, encryptedValue);

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockReturnValue(encryptedValue);

      // Mock decryption to throw an error
      (authUtils.decryptText as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Decryption failed');
      });

      const result = await service.get(key);

      expect(result).toBe(encryptedValue); // Should fall back to encrypted value
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
    });

    it('should skip decryption for non-string sensitive values', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const value = { someKey: 'someValue' };

      const mockRecord = createMockKeyValuePair(
        key as string,
        JSON.stringify(value),
      );

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.ARRAY,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockReturnValue(value);

      const result = await service.get(key);

      expect(result).toBe(value);
      expect(authUtils.decryptText).not.toHaveBeenCalled();
    });

    it('should handle decryption failure in loadAll() by skipping failed values', async () => {
      const configVars: KeyValuePair[] = [
        createMockKeyValuePair('SENSITIVE_CONFIG_1', 'encrypted:value1'),
        createMockKeyValuePair('SENSITIVE_CONFIG_2', 'encrypted:value2'),
        createMockKeyValuePair('NORMAL_CONFIG', 'normal-value'),
      ];

      jest.spyOn(keyValuePairRepository, 'find').mockResolvedValue(configVars);
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        SENSITIVE_CONFIG_1: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config 1',
        },
        SENSITIVE_CONFIG_2: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config 2',
        },
        NORMAL_CONFIG: {
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test normal config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockImplementation((value) => value);

      // Mock decryption to fail for the second sensitive value
      (authUtils.decryptText as jest.Mock)
        .mockImplementationOnce((text) => text.replace('encrypted:', ''))
        .mockImplementationOnce(() => {
          throw new Error('Decryption failed');
        });

      const result = await service.loadAll();

      expect(result.size).toBe(3);
      expect(result.get('SENSITIVE_CONFIG_1' as keyof ConfigVariables)).toBe(
        'value1',
      );
      expect(result.get('SENSITIVE_CONFIG_2' as keyof ConfigVariables)).toBe(
        'encrypted:value2',
      ); // Original encrypted value
      expect(result.get('NORMAL_CONFIG' as keyof ConfigVariables)).toBe(
        'normal-value',
      );
    });
  });

  describe('set', () => {
    it('should update existing record', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;
      const storedValue = 'true';

      const mockRecord = createMockKeyValuePair(key as string, 'false');

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      (
        configValueConverter.convertAppValueToDbValue as jest.Mock
      ).mockReturnValue(storedValue);

      await service.set(key, value);

      expect(keyValuePairRepository.update).toHaveBeenCalledWith(
        { id: '1' },
        { value: storedValue },
      );
    });

    it('should insert new record', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;
      const storedValue = 'true';

      jest.spyOn(keyValuePairRepository, 'findOne').mockResolvedValue(null);

      (
        configValueConverter.convertAppValueToDbValue as jest.Mock
      ).mockReturnValue(storedValue);

      await service.set(key, value);

      expect(keyValuePairRepository.insert).toHaveBeenCalledWith({
        key: key as string,
        value: storedValue,
        userId: null,
        workspaceId: null,
        type: KeyValuePairType.CONFIG_VARIABLE,
      });
    });

    it('should handle conversion errors', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const value = true;
      const error = new Error('Conversion error');

      (
        configValueConverter.convertAppValueToDbValue as jest.Mock
      ).mockImplementation(() => {
        throw error;
      });

      await expect(service.set(key, value)).rejects.toThrow('Conversion error');
    });

    it('should encrypt sensitive string values', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const value = 'sensitive-value';
      const convertedValue = 'sensitive-value';
      const encryptedValue = 'encrypted:sensitive-value';

      jest.spyOn(keyValuePairRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertAppValueToDbValue as jest.Mock
      ).mockReturnValue(convertedValue);

      await service.set(key, value);

      expect(keyValuePairRepository.insert).toHaveBeenCalledWith({
        key: key as string,
        value: encryptedValue,
        userId: null,
        workspaceId: null,
        type: KeyValuePairType.CONFIG_VARIABLE,
      });
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
      expect(authUtils.encryptText).toHaveBeenCalledWith(
        convertedValue,
        'test-secret',
      );
    });

    it('should handle encryption errors gracefully', async () => {
      const key = 'SENSITIVE_CONFIG' as keyof ConfigVariables;
      const value = 'sensitive-value';
      const convertedValue = 'sensitive-value';

      jest.spyOn(keyValuePairRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        [key]: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
      });

      (
        configValueConverter.convertAppValueToDbValue as jest.Mock
      ).mockReturnValue(convertedValue);

      // Mock encryption to throw an error
      (authUtils.encryptText as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Encryption failed');
      });

      await service.set(key, value);

      expect(keyValuePairRepository.insert).toHaveBeenCalledWith({
        key: key as string,
        value: convertedValue, // Should fall back to unconverted value
        userId: null,
        workspaceId: null,
        type: KeyValuePairType.CONFIG_VARIABLE,
      });
    });
  });

  describe('delete', () => {
    it('should delete record', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

      await service.delete(key);

      expect(keyValuePairRepository.delete).toHaveBeenCalledWith({
        type: KeyValuePairType.CONFIG_VARIABLE,
        key: key as string,
        userId: IsNull(),
        workspaceId: IsNull(),
      });
    });

    it('should handle delete errors', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const error = new Error('Delete error');

      jest.spyOn(keyValuePairRepository, 'delete').mockRejectedValue(error);

      await expect(service.delete(key)).rejects.toThrow('Delete error');
    });
  });

  describe('loadAll', () => {
    it('should load and convert all config variables', async () => {
      const configVars: KeyValuePair[] = [
        createMockKeyValuePair('AUTH_PASSWORD_ENABLED', 'true'),
        createMockKeyValuePair('EMAIL_FROM_ADDRESS', 'test@example.com'),
      ];

      jest.spyOn(keyValuePairRepository, 'find').mockResolvedValue(configVars);

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockImplementation((value, key) => {
        if (key === 'AUTH_PASSWORD_ENABLED') return true;
        if (key === 'EMAIL_FROM_ADDRESS') return 'test@example.com';

        return value;
      });

      const result = await service.loadAll();

      expect(result.size).toBe(2);
      expect(result.get('AUTH_PASSWORD_ENABLED' as keyof ConfigVariables)).toBe(
        true,
      );
      expect(result.get('EMAIL_FROM_ADDRESS' as keyof ConfigVariables)).toBe(
        'test@example.com',
      );
    });

    it('should skip invalid values but continue processing', async () => {
      const configVars: KeyValuePair[] = [
        createMockKeyValuePair('AUTH_PASSWORD_ENABLED', 'invalid'),
        createMockKeyValuePair('EMAIL_FROM_ADDRESS', 'test@example.com'),
      ];

      jest.spyOn(keyValuePairRepository, 'find').mockResolvedValue(configVars);

      (configValueConverter.convertDbValueToAppValue as jest.Mock)
        .mockImplementationOnce(() => {
          throw new Error('Invalid value');
        })
        .mockImplementationOnce((value) => value);

      const result = await service.loadAll();

      expect(result.size).toBe(1);
      expect(result.get('EMAIL_FROM_ADDRESS' as keyof ConfigVariables)).toBe(
        'test@example.com',
      );
    });

    it('should handle find errors', async () => {
      const error = new Error('Find error');

      jest.spyOn(keyValuePairRepository, 'find').mockRejectedValue(error);

      await expect(service.loadAll()).rejects.toThrow('Find error');
    });

    describe('Null Value Handling', () => {
      it('should handle null values in loadAll', async () => {
        const configVars: KeyValuePair[] = [
          {
            ...createMockKeyValuePair('AUTH_PASSWORD_ENABLED', 'true'),
            value: null as unknown as JSON,
          },
          createMockKeyValuePair('EMAIL_FROM_ADDRESS', 'test@example.com'),
        ];

        jest
          .spyOn(keyValuePairRepository, 'find')
          .mockResolvedValue(configVars);

        (
          configValueConverter.convertDbValueToAppValue as jest.Mock
        ).mockImplementation((value) => {
          if (value === null) throw new Error('Null value');

          return value;
        });

        const result = await service.loadAll();

        expect(result.size).toBe(1);
        expect(result.get('EMAIL_FROM_ADDRESS' as keyof ConfigVariables)).toBe(
          'test@example.com',
        );
        expect(
          configValueConverter.convertDbValueToAppValue,
        ).toHaveBeenCalledTimes(1); // Only called for non-null value
      });
    });

    it('should decrypt sensitive string values in loadAll', async () => {
      const configVars: KeyValuePair[] = [
        createMockKeyValuePair('SENSITIVE_CONFIG', 'encrypted:sensitive-value'),
        createMockKeyValuePair('NORMAL_CONFIG', 'normal-value'),
      ];

      jest.spyOn(keyValuePairRepository, 'find').mockResolvedValue(configVars);
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValue({
        SENSITIVE_CONFIG: {
          isSensitive: true,
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test sensitive config',
        },
        NORMAL_CONFIG: {
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test normal config',
        },
      });

      (
        configValueConverter.convertDbValueToAppValue as jest.Mock
      ).mockImplementation((value) => value);

      const result = await service.loadAll();

      expect(result.size).toBe(2);
      expect(result.get('SENSITIVE_CONFIG' as keyof ConfigVariables)).toBe(
        'sensitive-value',
      );
      expect(result.get('NORMAL_CONFIG' as keyof ConfigVariables)).toBe(
        'normal-value',
      );
      expect(environmentConfigDriver.get).toHaveBeenCalledWith('APP_SECRET');
      expect(authUtils.decryptText).toHaveBeenCalledWith(
        'encrypted:sensitive-value',
        'test-secret',
      );
    });
  });

  describe('Edge Cases and Additional Scenarios', () => {
    describe('Type Safety', () => {
      it('should enforce correct types for boolean config variables', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const invalidValue = 'not-a-boolean';

        const mockRecord = createMockKeyValuePair(key as string, invalidValue);

        jest
          .spyOn(keyValuePairRepository, 'findOne')
          .mockResolvedValue(mockRecord);

        (
          configValueConverter.convertDbValueToAppValue as jest.Mock
        ).mockImplementation(() => {
          throw new Error('Invalid boolean value');
        });

        await expect(service.get(key)).rejects.toThrow('Invalid boolean value');
      });

      it('should enforce correct types for string config variables', async () => {
        const key = 'EMAIL_FROM_ADDRESS' as keyof ConfigVariables;
        const invalidValue = '123'; // Not a valid email

        const mockRecord = createMockKeyValuePair(key as string, invalidValue);

        jest
          .spyOn(keyValuePairRepository, 'findOne')
          .mockResolvedValue(mockRecord);

        (
          configValueConverter.convertDbValueToAppValue as jest.Mock
        ).mockImplementation(() => {
          throw new Error('Invalid string value');
        });

        await expect(service.get(key)).rejects.toThrow('Invalid string value');
      });
    });

    describe('Concurrent Operations', () => {
      it('should handle concurrent get/set operations', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const initialValue = true;
        const newValue = false;

        const initialRecord = createMockKeyValuePair(key as string, 'true');
        const updatedRecord = createMockKeyValuePair(key as string, 'false');

        jest
          .spyOn(keyValuePairRepository, 'findOne')
          .mockResolvedValueOnce(initialRecord)
          .mockResolvedValueOnce(initialRecord)
          .mockResolvedValueOnce(updatedRecord);

        (configValueConverter.convertDbValueToAppValue as jest.Mock)
          .mockReturnValueOnce(initialValue)
          .mockReturnValueOnce(newValue);

        (
          configValueConverter.convertAppValueToDbValue as jest.Mock
        ).mockReturnValueOnce('false');

        const firstGet = service.get(key);
        const setOperation = service.set(key, newValue);
        const secondGet = service.get(key);

        const [firstResult, , secondResult] = await Promise.all([
          firstGet,
          setOperation,
          secondGet,
        ]);

        expect(firstResult).toBe(initialValue);
        expect(secondResult).toBe(newValue);
      });

      it('should handle concurrent delete operations', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;

        jest
          .spyOn(keyValuePairRepository, 'delete')
          .mockResolvedValueOnce({ affected: 1 } as DeleteResult)
          .mockResolvedValueOnce({ affected: 0 } as DeleteResult);

        const firstDelete = service.delete(key);
        const secondDelete = service.delete(key);

        await Promise.all([firstDelete, secondDelete]);

        expect(keyValuePairRepository.delete).toHaveBeenCalledTimes(2);
      });
    });

    describe('Database Connection Issues', () => {
      it('should handle database connection failures in get', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const error = new Error('Database connection failed');

        jest.spyOn(keyValuePairRepository, 'findOne').mockRejectedValue(error);

        await expect(service.get(key)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle database connection failures in set', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const value = true;
        const error = new Error('Database connection failed');

        (
          configValueConverter.convertAppValueToDbValue as jest.Mock
        ).mockReturnValue('true');
        jest.spyOn(keyValuePairRepository, 'findOne').mockRejectedValue(error);

        await expect(service.set(key, value)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle database connection failures in delete', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const error = new Error('Database connection failed');

        jest.spyOn(keyValuePairRepository, 'delete').mockRejectedValue(error);

        await expect(service.delete(key)).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle database connection failures in loadAll', async () => {
        const error = new Error('Database connection failed');

        jest.spyOn(keyValuePairRepository, 'find').mockRejectedValue(error);

        await expect(service.loadAll()).rejects.toThrow(
          'Database connection failed',
        );
      });

      it('should handle database operation timeouts', async () => {
        const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
        const error = new Error('Database operation timed out');

        let rejectPromise: ((error: Error) => void) | undefined;
        const timeoutPromise = new Promise<KeyValuePair | null>((_, reject) => {
          rejectPromise = reject;
        });

        jest
          .spyOn(keyValuePairRepository, 'findOne')
          .mockReturnValue(timeoutPromise);

        const promise = service.get(key);

        // Simulate timeout by rejecting the promise
        if (!rejectPromise) {
          throw new Error('Reject function not assigned');
        }
        rejectPromise(error);

        await expect(promise).rejects.toThrow('Database operation timed out');
      });
    });
  });
});
