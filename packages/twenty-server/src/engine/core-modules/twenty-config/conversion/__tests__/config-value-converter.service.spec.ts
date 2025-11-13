import { type LogLevel } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { ConfigValueConverterService } from 'src/engine/core-modules/twenty-config/conversion/config-value-converter.service';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import * as typeTransformersModule from 'src/engine/core-modules/twenty-config/utils/type-transformers.registry';
import { TypedReflect } from 'src/utils/typed-reflect';

jest.mock(
  'src/engine/core-modules/twenty-config/utils/type-transformers.registry',
  () => {
    const createMockTransformer = () => ({
      toApp: jest.fn().mockImplementation((value) => value),
      toStorage: jest.fn().mockImplementation((value) => value),
      getValidators: jest.fn().mockReturnValue([]),
      getTransformers: jest.fn().mockReturnValue([]),
    });

    const mockRegistry = {
      boolean: createMockTransformer(),
      number: createMockTransformer(),
      string: createMockTransformer(),
      array: createMockTransformer(),
      enum: createMockTransformer(),
    };

    return {
      typeTransformers: mockRegistry,
    };
  },
);

const typeTransformers = typeTransformersModule.typeTransformers as {
  boolean: {
    toApp: jest.Mock;
    toStorage: jest.Mock;
    getValidators: jest.Mock;
    getTransformers: jest.Mock;
  };
  number: {
    toApp: jest.Mock;
    toStorage: jest.Mock;
    getValidators: jest.Mock;
    getTransformers: jest.Mock;
  };
  string: {
    toApp: jest.Mock;
    toStorage: jest.Mock;
    getValidators: jest.Mock;
    getTransformers: jest.Mock;
  };
  array: {
    toApp: jest.Mock;
    toStorage: jest.Mock;
    getValidators: jest.Mock;
    getTransformers: jest.Mock;
  };
  enum: {
    toApp: jest.Mock;
    toStorage: jest.Mock;
    getValidators: jest.Mock;
    getTransformers: jest.Mock;
  };
};

describe('ConfigValueConverterService', () => {
  let service: ConfigValueConverterService;

  beforeEach(async () => {
    jest.clearAllMocks();

    Object.values(typeTransformers).forEach((transformer) => {
      transformer.toApp.mockImplementation((value) => value);
      transformer.toStorage.mockImplementation((value) => value);
    });

    const mockConfigVariables = {
      CACHE_STORAGE_TTL: 3600 * 24 * 7,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigValueConverterService,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: mockConfigVariables,
        },
      ],
    }).compile();

    service = module.get<ConfigValueConverterService>(
      ConfigValueConverterService,
    );
  });

  describe('convertDbValueToAppValue', () => {
    it('should use boolean transformer for boolean type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: ConfigVariableType.BOOLEAN,
          group: ConfigVariablesGroup.OTHER,
          description: 'Enable or disable password authentication for users',
        },
      });

      typeTransformers.boolean.toApp.mockReturnValueOnce(true);

      const result = service.convertDbValueToAppValue(
        'true',
        'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
      );

      expect(typeTransformers.boolean.toApp).toHaveBeenCalledWith(
        'true',
        undefined,
      );
      expect(result).toBe(true);
    });

    it('should use number transformer for number type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CACHE_STORAGE_TTL: {
          type: ConfigVariableType.NUMBER,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Time-to-live for cache storage in seconds',
        },
      });

      typeTransformers.number.toApp.mockReturnValueOnce(3600 * 24 * 7);

      const result = service.convertDbValueToAppValue(
        '604800',
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(typeTransformers.number.toApp).toHaveBeenCalledWith(
        '604800',
        undefined,
      );
      expect(result).toBe(3600 * 24 * 7);
    });

    it('should use string transformer for string type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        FRONTEND_URL: {
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Frontend URL',
        },
      });

      typeTransformers.string.toApp.mockReturnValueOnce(
        'http://localhost:3000',
      );

      const result = service.convertDbValueToAppValue(
        'http://localhost:3000',
        'FRONTEND_URL' as keyof ConfigVariables,
      );

      expect(typeTransformers.string.toApp).toHaveBeenCalledWith(
        'http://localhost:3000',
        undefined,
      );
      expect(result).toBe('http://localhost:3000');
    });

    it('should use array transformer for array type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: ConfigVariableType.ARRAY,
          group: ConfigVariablesGroup.LOGGING,
          description: 'Levels of logging to be captured',
          options: ['log', 'error', 'warn', 'debug', 'verbose'],
        },
      });

      const expectedResult = ['log', 'error', 'warn'] as unknown as LogLevel[];

      typeTransformers.array.toApp.mockReturnValueOnce(expectedResult);

      const result = service.convertDbValueToAppValue(
        'log,error,warn',
        'LOG_LEVELS' as keyof ConfigVariables,
      );

      expect(typeTransformers.array.toApp).toHaveBeenCalledWith(
        'log,error,warn',
        ['log', 'error', 'warn', 'debug', 'verbose'],
      );
      expect(result).toEqual(expectedResult);
    });

    it('should use enum transformer for enum type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_ENV: {
          type: ConfigVariableType.ENUM,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Node environment',
          options: ['development', 'production', 'test'],
        },
      });

      typeTransformers.enum.toApp.mockReturnValueOnce('development');

      const result = service.convertDbValueToAppValue(
        'development',
        'NODE_ENV' as keyof ConfigVariables,
      );

      expect(typeTransformers.enum.toApp).toHaveBeenCalledWith('development', [
        'development',
        'production',
        'test',
      ]);
      expect(result).toBe('development');
    });

    it('should infer type from default value when no metadata is available', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      typeTransformers.number.toApp.mockReturnValueOnce(3600 * 24 * 7);

      const result = service.convertDbValueToAppValue(
        '604800',
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(typeTransformers.number.toApp).toHaveBeenCalledWith(
        '604800',
        undefined,
      );
      expect(result).toBe(3600 * 24 * 7);
    });

    it('should return undefined for null or undefined input', () => {
      const result1 = service.convertDbValueToAppValue(
        null,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );
      const result2 = service.convertDbValueToAppValue(
        undefined,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(result1).toBeUndefined();
      expect(result2).toBeUndefined();
    });

    it('should propagate errors from transformers with context', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CACHE_STORAGE_TTL: {
          type: ConfigVariableType.NUMBER,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Time-to-live for cache storage in seconds',
        },
      });

      const error = new Error('Test error');

      typeTransformers.number.toApp.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => {
        service.convertDbValueToAppValue(
          'not-a-number',
          'CACHE_STORAGE_TTL' as keyof ConfigVariables,
        );
      }).toThrow(
        `Failed to convert CACHE_STORAGE_TTL to app value: Test error`,
      );
    });
  });

  describe('convertAppValueToDbValue', () => {
    it('should use boolean transformer for boolean type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: ConfigVariableType.BOOLEAN,
          group: ConfigVariablesGroup.OTHER,
          description: 'Enable or disable password authentication for users',
        },
      });

      typeTransformers.boolean.toStorage.mockReturnValueOnce(true);

      const result = service.convertAppValueToDbValue(
        true,
        'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
      );

      expect(typeTransformers.boolean.toStorage).toHaveBeenCalledWith(
        true,
        undefined,
      );
      expect(result).toBe(true);
    });

    it('should use number transformer for number type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CACHE_STORAGE_TTL: {
          type: ConfigVariableType.NUMBER,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Time-to-live for cache storage in seconds',
        },
      });

      typeTransformers.number.toStorage.mockReturnValueOnce(3600 * 24 * 7);

      const result = service.convertAppValueToDbValue(
        3600 * 24 * 7,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(typeTransformers.number.toStorage).toHaveBeenCalledWith(
        3600 * 24 * 7,
        undefined,
      );
      expect(result).toBe(3600 * 24 * 7);
    });

    it('should use string transformer for string type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        FRONTEND_URL: {
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Frontend URL',
        },
      });

      typeTransformers.string.toStorage.mockReturnValueOnce(
        'http://localhost:3000',
      );

      const result = service.convertAppValueToDbValue(
        'http://localhost:3000',
        'FRONTEND_URL' as keyof ConfigVariables,
      );

      expect(typeTransformers.string.toStorage).toHaveBeenCalledWith(
        'http://localhost:3000',
        undefined,
      );
      expect(result).toBe('http://localhost:3000');
    });

    it('should use array transformer for array type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: ConfigVariableType.ARRAY,
          group: ConfigVariablesGroup.LOGGING,
          description: 'Levels of logging to be captured',
          options: ['log', 'error', 'warn', 'debug', 'verbose'],
        },
      });

      const inputArray = ['log', 'error', 'warn'] as LogLevel[];
      const expectedResult = ['log', 'error', 'warn'];

      typeTransformers.array.toStorage.mockReturnValueOnce(expectedResult);

      const result = service.convertAppValueToDbValue(
        inputArray,
        'LOG_LEVELS' as keyof ConfigVariables,
      );

      expect(typeTransformers.array.toStorage).toHaveBeenCalledWith(
        inputArray,
        ['log', 'error', 'warn', 'debug', 'verbose'],
      );
      expect(result).toEqual(expectedResult);
    });

    it('should use enum transformer for enum type', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_ENV: {
          type: ConfigVariableType.ENUM,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Node environment',
          options: ['development', 'production', 'test'],
        },
      });

      typeTransformers.enum.toStorage.mockReturnValueOnce('development');

      const result = service.convertAppValueToDbValue(
        'development',
        'NODE_ENV' as keyof ConfigVariables,
      );

      expect(typeTransformers.enum.toStorage).toHaveBeenCalledWith(
        'development',
        ['development', 'production', 'test'],
      );
      expect(result).toBe('development');
    });

    it('should infer type from default value when no metadata is available', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      typeTransformers.number.toStorage.mockReturnValueOnce(3600 * 24 * 7);

      const result = service.convertAppValueToDbValue(
        3600 * 24 * 7,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(typeTransformers.number.toStorage).toHaveBeenCalledWith(
        3600 * 24 * 7,
        undefined,
      );
      expect(result).toBe(3600 * 24 * 7);
    });

    it('should return null for null or undefined input', () => {
      const result1 = service.convertAppValueToDbValue(
        null,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );
      const result2 = service.convertAppValueToDbValue(
        undefined,
        'CACHE_STORAGE_TTL' as keyof ConfigVariables,
      );

      expect(result1).toBeNull();
      expect(result2).toBeNull();
    });

    it('should handle object serialization when no transformer is found', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CUSTOM_OBJECT: {
          type: 'unknown-type' as ConfigVariableType,
          group: ConfigVariablesGroup.OTHER,
          description: 'Custom object',
        },
      });

      const obj = { key: 'value' };

      const result = service.convertAppValueToDbValue(
        obj as any,
        'CUSTOM_OBJECT' as keyof ConfigVariables,
      );

      expect(result).toEqual(obj);
    });

    it('should propagate errors from transformers with context', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CACHE_STORAGE_TTL: {
          type: ConfigVariableType.NUMBER,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Time-to-live for cache storage in seconds',
        },
      });

      const error = new Error('Test error');

      typeTransformers.number.toStorage.mockImplementationOnce(() => {
        throw error;
      });

      expect(() => {
        service.convertAppValueToDbValue(
          'not-a-number' as any,
          'CACHE_STORAGE_TTL' as keyof ConfigVariables,
        );
      }).toThrow(`Failed to convert CACHE_STORAGE_TTL to DB value: Test error`);
    });
  });

  describe('convertAppValueToDbValue bidirectional validation', () => {
    it('should validate boolean values when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: ConfigVariableType.BOOLEAN,
          group: ConfigVariablesGroup.OTHER,
          description: 'Enable or disable password authentication for users',
        },
      });

      typeTransformers.boolean.toStorage.mockImplementationOnce(() => {
        throw new Error('Expected boolean, got string');
      });

      expect(() => {
        service.convertAppValueToDbValue(
          'not-a-boolean' as any,
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        );
      }).toThrow(
        'Failed to convert AUTH_PASSWORD_ENABLED to DB value: Expected boolean, got string',
      );
    });

    it('should validate number values when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        CACHE_STORAGE_TTL: {
          type: ConfigVariableType.NUMBER,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Time-to-live for cache storage in seconds',
        },
      });

      typeTransformers.number.toStorage.mockImplementationOnce(() => {
        throw new Error('Expected number, got string');
      });

      expect(() => {
        service.convertAppValueToDbValue(
          'invalid-ttl' as any,
          'CACHE_STORAGE_TTL' as keyof ConfigVariables,
        );
      }).toThrow(
        'Failed to convert CACHE_STORAGE_TTL to DB value: Expected number, got string',
      );
    });

    it('should validate string values when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        FRONTEND_URL: {
          type: ConfigVariableType.STRING,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Frontend URL',
        },
      });

      typeTransformers.string.toStorage.mockImplementationOnce(() => {
        throw new Error('Expected string, got object');
      });

      expect(() => {
        service.convertAppValueToDbValue(
          {} as any,
          'FRONTEND_URL' as keyof ConfigVariables,
        );
      }).toThrow(
        'Failed to convert FRONTEND_URL to DB value: Expected string, got object',
      );
    });

    it('should validate array values when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: ConfigVariableType.ARRAY,
          group: ConfigVariablesGroup.LOGGING,
          description: 'Levels of logging to be captured',
          options: ['log', 'error', 'warn', 'debug', 'verbose'],
        },
      });

      typeTransformers.array.toStorage.mockImplementationOnce(() => {
        throw new Error('Expected array, got string');
      });

      expect(() => {
        service.convertAppValueToDbValue(
          'not-an-array' as any,
          'LOG_LEVELS' as keyof ConfigVariables,
        );
      }).toThrow(
        'Failed to convert LOG_LEVELS to DB value: Expected array, got string',
      );
    });

    it('should validate enum values when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_ENV: {
          type: ConfigVariableType.ENUM,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Node environment',
          options: ['development', 'production', 'test'],
        },
      });

      typeTransformers.enum.toStorage.mockImplementationOnce(() => {
        throw new Error("Value 'invalid-env' is not a valid option for enum");
      });

      expect(() => {
        service.convertAppValueToDbValue(
          'invalid-env' as any,
          'NODE_ENV' as keyof ConfigVariables,
        );
      }).toThrow(
        "Failed to convert NODE_ENV to DB value: Value 'invalid-env' is not a valid option for enum",
      );
    });

    it('should validate enum values against options', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_ENV: {
          type: ConfigVariableType.ENUM,
          group: ConfigVariablesGroup.SERVER_CONFIG,
          description: 'Node environment',
          options: ['development', 'production', 'test'],
        },
      });

      typeTransformers.enum.toStorage.mockImplementation((value, options) => {
        if (!options?.includes(value)) {
          throw new Error(`Value '${value}' is not a valid option for enum`);
        }

        return value;
      });

      expect(
        service.convertAppValueToDbValue(
          'development' as any,
          'NODE_ENV' as keyof ConfigVariables,
        ),
      ).toBe('development');

      expect(() => {
        service.convertAppValueToDbValue(
          'staging' as any,
          'NODE_ENV' as keyof ConfigVariables,
        );
      }).toThrow(
        "Failed to convert NODE_ENV to DB value: Value 'staging' is not a valid option for enum",
      );
    });

    it('should filter array values based on options when converting to storage', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: ConfigVariableType.ARRAY,
          group: ConfigVariablesGroup.LOGGING,
          description: 'Levels of logging to be captured',
          options: ['log', 'error', 'warn', 'debug', 'verbose'],
        },
      });

      typeTransformers.array.toStorage.mockImplementation((value, options) => {
        if (!Array.isArray(value)) {
          throw new Error(`Expected array, got ${typeof value}`);
        }

        if (!options || !Array.isArray(options) || options.length === 0) {
          return value;
        }

        return value.filter((item) => options.includes(item));
      });

      const result = service.convertAppValueToDbValue(
        ['log', 'invalid-level', 'error'] as any,
        'LOG_LEVELS' as keyof ConfigVariables,
      );

      expect(result).toEqual(['log', 'error']);

      expect(typeTransformers.array.toStorage).toHaveBeenCalledWith(
        ['log', 'invalid-level', 'error'],
        ['log', 'error', 'warn', 'debug', 'verbose'],
      );
    });
  });
});
