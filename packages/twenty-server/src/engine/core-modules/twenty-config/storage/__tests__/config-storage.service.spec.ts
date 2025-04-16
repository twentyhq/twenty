import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { DeleteResult, IsNull, Repository } from 'typeorm';

import {
  KeyValuePair,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigStorageService } from 'src/engine/core-modules/twenty-config/storage/config-storage.service';
import { convertConfigVarToAppType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-app-type.util';
import { convertConfigVarToStorageType } from 'src/engine/core-modules/twenty-config/utils/convert-config-var-to-storage-type.util';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

jest.mock(
  'src/engine/core-modules/twenty-config/utils/convert-config-var-to-app-type.util',
  () => ({
    convertConfigVarToAppType: jest.fn(),
  }),
);

jest.mock(
  'src/engine/core-modules/twenty-config/utils/convert-config-var-to-storage-type.util',
  () => ({
    convertConfigVarToStorageType: jest.fn(),
  }),
);

describe('ConfigStorageService', () => {
  let service: ConfigStorageService;
  let keyValuePairRepository: Repository<KeyValuePair>;

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

      (convertConfigVarToAppType as jest.Mock).mockReturnValue(convertedValue);

      const result = await service.get(key);

      expect(result).toBe(convertedValue);
      expect(convertConfigVarToAppType).toHaveBeenCalledWith(storedValue, key);
    });

    it('should handle conversion errors', async () => {
      const key = 'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables;
      const error = new Error('Conversion error');

      const mockRecord = createMockKeyValuePair(key as string, 'invalid');

      jest
        .spyOn(keyValuePairRepository, 'findOne')
        .mockResolvedValue(mockRecord);

      (convertConfigVarToAppType as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(service.get(key)).rejects.toThrow('Conversion error');
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

      (convertConfigVarToStorageType as jest.Mock).mockReturnValue(storedValue);

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

      (convertConfigVarToStorageType as jest.Mock).mockReturnValue(storedValue);

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

      (convertConfigVarToStorageType as jest.Mock).mockImplementation(() => {
        throw error;
      });

      await expect(service.set(key, value)).rejects.toThrow('Conversion error');
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

      (convertConfigVarToAppType as jest.Mock).mockImplementation(
        (value, key) => {
          if (key === 'AUTH_PASSWORD_ENABLED') return true;
          if (key === 'EMAIL_FROM_ADDRESS') return 'test@example.com';

          return value;
        },
      );

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

      (convertConfigVarToAppType as jest.Mock)
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

        (convertConfigVarToAppType as jest.Mock).mockImplementation((value) => {
          if (value === null) throw new Error('Null value');

          return value;
        });

        const result = await service.loadAll();

        expect(result.size).toBe(1);
        expect(result.get('EMAIL_FROM_ADDRESS' as keyof ConfigVariables)).toBe(
          'test@example.com',
        );
        expect(convertConfigVarToAppType).toHaveBeenCalledTimes(1); // Only called for non-null value
      });
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

        (convertConfigVarToAppType as jest.Mock).mockImplementation(() => {
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

        (convertConfigVarToAppType as jest.Mock).mockImplementation(() => {
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

        (convertConfigVarToAppType as jest.Mock)
          .mockReturnValueOnce(initialValue)
          .mockReturnValueOnce(newValue);

        (convertConfigVarToStorageType as jest.Mock).mockReturnValueOnce(
          'false',
        );

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

        (convertConfigVarToStorageType as jest.Mock).mockReturnValue('true');
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
