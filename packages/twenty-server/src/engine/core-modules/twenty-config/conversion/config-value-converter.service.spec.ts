import { LogLevel } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { TypedReflect } from 'src/utils/typed-reflect';

import { ConfigValueConverterService } from './config-value-converter.service';

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
  });
});
