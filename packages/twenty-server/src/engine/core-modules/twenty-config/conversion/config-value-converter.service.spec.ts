import { LogLevel } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { TypedReflect } from 'src/utils/typed-reflect';

import { ConfigValueConverterService } from './config-value-converter.service';

// Mock configTransformers for type validation tests
jest.mock(
  'src/engine/core-modules/twenty-config/utils/config-transformers.util',
  () => {
    const originalModule = jest.requireActual(
      'src/engine/core-modules/twenty-config/utils/config-transformers.util',
    );

    return {
      configTransformers: {
        ...originalModule.configTransformers,
        // These mocked versions can be overridden in specific tests
        _mockedBoolean: jest.fn(),
        _mockedNumber: jest.fn(),
        _mockedString: jest.fn(),
      },
    };
  },
);

describe('ConfigValueConverterService', () => {
  let service: ConfigValueConverterService;

  beforeEach(async () => {
    const mockConfigVariables = {
      NODE_PORT: 3000,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigValueConverterService,
        {
          provide: ConfigVariables,
          useValue: mockConfigVariables,
        },
      ],
    }).compile();

    service = module.get<ConfigValueConverterService>(
      ConfigValueConverterService,
    );
  });

  describe('convertDbValueToAppValue', () => {
    it('should convert string to boolean based on metadata', () => {
      // Mock the metadata
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: 'boolean',
          group: ConfigVariablesGroup.Other,
          description: 'Enable or disable password authentication for users',
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'true',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertDbValueToAppValue(
          'True',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertDbValueToAppValue(
          'yes',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertDbValueToAppValue(
          '1',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);

      expect(
        service.convertDbValueToAppValue(
          'false',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertDbValueToAppValue(
          'False',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertDbValueToAppValue(
          'no',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertDbValueToAppValue(
          '0',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
    });

    it('should convert string to number based on metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_PORT: {
          type: 'number',
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Port for the node server',
        },
      });

      expect(
        service.convertDbValueToAppValue(
          '42',
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBe(42);
      expect(
        service.convertDbValueToAppValue(
          '3.14',
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBe(3.14);

      expect(
        service.convertDbValueToAppValue(
          'not-a-number',
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBeUndefined();
    });

    it('should convert string to array based on metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Levels of logging to be captured',
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'log,error,warn',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error', 'warn']);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Levels of logging to be captured',
        },
      });
      expect(
        service.convertDbValueToAppValue(
          '["log","error","warn"]',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error', 'warn']);
    });

    it('should handle enum values as strings', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      expect(
        service.convertDbValueToAppValue(
          'development',
          'NODE_ENV' as keyof ConfigVariables,
        ),
      ).toBe('development');
    });

    it('should handle various input types', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: 'boolean',
          group: ConfigVariablesGroup.Other,
          description: 'Enable or disable password authentication for users',
        },
      });
      expect(
        service.convertDbValueToAppValue(
          true,
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_PORT: {
          type: 'number',
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Port for the node server',
        },
      });
      expect(
        service.convertDbValueToAppValue(
          42,
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBe(42);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Levels of logging to be captured',
        },
      });
      expect(
        service.convertDbValueToAppValue(
          ['log', 'error'] as LogLevel[],
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error']);
    });

    it('should fall back to default value approach when no metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      expect(
        service.convertDbValueToAppValue(
          '42',
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBe(42);
    });

    it('should handle null and undefined values', () => {
      expect(
        service.convertDbValueToAppValue(
          null,
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBeUndefined();

      expect(
        service.convertDbValueToAppValue(
          undefined,
          'NODE_PORT' as keyof ConfigVariables,
        ),
      ).toBeUndefined();
    });

    it('should throw error if boolean converter returns non-boolean', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        AUTH_PASSWORD_ENABLED: {
          type: 'boolean',
          group: ConfigVariablesGroup.Other,
          description: 'Test boolean',
        },
      });

      const originalBoolean = configTransformers.boolean;

      configTransformers.boolean = jest
        .fn()
        .mockImplementation(() => 'not-a-boolean');

      expect(() => {
        service.convertDbValueToAppValue(
          'true',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        );
      }).toThrow(/Expected boolean for key AUTH_PASSWORD_ENABLED/);

      configTransformers.boolean = originalBoolean;
    });

    it('should throw error if number converter returns non-number', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        NODE_PORT: {
          type: 'number',
          group: ConfigVariablesGroup.ServerConfig,
          description: 'Test number',
        },
      });

      const originalNumber = configTransformers.number;

      configTransformers.number = jest
        .fn()
        .mockImplementation(() => 'not-a-number');

      expect(() => {
        service.convertDbValueToAppValue(
          '42',
          'NODE_PORT' as keyof ConfigVariables,
        );
      }).toThrow(/Expected number for key NODE_PORT/);

      configTransformers.number = originalNumber;
    });

    it('should throw error if string converter returns non-string', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        EMAIL_FROM_ADDRESS: {
          type: 'string',
          group: ConfigVariablesGroup.EmailSettings,
          description: 'Test string',
        },
      });

      const originalString = configTransformers.string;

      configTransformers.string = jest.fn().mockImplementation(() => 42);

      expect(() => {
        service.convertDbValueToAppValue(
          'test@example.com',
          'EMAIL_FROM_ADDRESS' as keyof ConfigVariables,
        );
      }).toThrow(/Expected string for key EMAIL_FROM_ADDRESS/);

      configTransformers.string = originalString;
    });

    it('should throw error if array conversion produces non-array', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Test array',
        },
      });

      const convertToArraySpy = jest
        .spyOn(
          service as any, // Cast to any to access private method
          'convertToArray',
        )
        .mockReturnValueOnce('not-an-array');

      expect(() => {
        service.convertDbValueToAppValue(
          'log,error,warn',
          'LOG_LEVELS' as keyof ConfigVariables,
        );
      }).toThrow(/Expected array for key LOG_LEVELS/);

      convertToArraySpy.mockRestore();
    });

    it('should handle array with option validation', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Test array with options',
          options: ['log', 'error', 'warn', 'debug'],
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'log,error,warn',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error', 'warn']);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVELS: {
          type: 'array',
          group: ConfigVariablesGroup.Logging,
          description: 'Test array with options',
          options: ['log', 'error', 'warn', 'debug'],
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'log,invalid,warn',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'warn']);
    });

    it('should properly handle enum with options', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVEL: {
          type: 'enum',
          group: ConfigVariablesGroup.Logging,
          description: 'Test enum',
          options: ['log', 'error', 'warn', 'debug'],
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'error',
          'LOG_LEVEL' as keyof ConfigVariables,
        ),
      ).toBe('error');

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce({
        LOG_LEVEL: {
          type: 'enum',
          group: ConfigVariablesGroup.Logging,
          description: 'Test enum',
          options: ['log', 'error', 'warn', 'debug'],
        },
      });

      expect(
        service.convertDbValueToAppValue(
          'invalid',
          'LOG_LEVEL' as keyof ConfigVariables,
        ),
      ).toBeUndefined();
    });
  });

  describe('convertAppValueToDbValue', () => {
    it('should handle primitive types directly', () => {
      expect(service.convertAppValueToDbValue('string-value' as any)).toBe(
        'string-value',
      );
      expect(service.convertAppValueToDbValue(42 as any)).toBe(42);
      expect(service.convertAppValueToDbValue(true as any)).toBe(true);
      expect(service.convertAppValueToDbValue(undefined as any)).toBe(null);
    });

    it('should handle arrays', () => {
      const array = ['log', 'error', 'warn'] as LogLevel[];

      expect(service.convertAppValueToDbValue(array as any)).toEqual(array);
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };

      expect(service.convertAppValueToDbValue(obj as any)).toEqual(obj);
    });

    it('should convert null to null', () => {
      expect(service.convertAppValueToDbValue(null as any)).toBe(null);
    });

    it('should throw error for unsupported types', () => {
      const symbol = Symbol('test');

      expect(() => {
        service.convertAppValueToDbValue(symbol as any);
      }).toThrow(/Cannot convert value of type symbol/);
    });

    it('should handle serialization errors', () => {
      // Create an object with circular reference
      const circular: any = {};

      circular.self = circular;

      expect(() => {
        service.convertAppValueToDbValue(circular as any);
      }).toThrow(/Failed to serialize object value/);
    });
  });
});
