import { LogLevel } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
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

  describe('convertToAppValue', () => {
    it('should convert string to boolean based on metadata', () => {
      // Mock the metadata
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('boolean');

      expect(
        service.convertToAppValue(
          'true',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertToAppValue(
          'True',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertToAppValue(
          'yes',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);
      expect(
        service.convertToAppValue(
          '1',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);

      expect(
        service.convertToAppValue(
          'false',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertToAppValue(
          'False',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertToAppValue(
          'no',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
      expect(
        service.convertToAppValue(
          '0',
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(false);
    });

    it('should convert string to number based on metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('number');

      expect(
        service.convertToAppValue('42', 'NODE_PORT' as keyof ConfigVariables),
      ).toBe(42);
      expect(
        service.convertToAppValue('3.14', 'NODE_PORT' as keyof ConfigVariables),
      ).toBe(3.14);

      expect(() => {
        service.convertToAppValue(
          'not-a-number',
          'NODE_PORT' as keyof ConfigVariables,
        );
      }).toThrow();
    });

    it('should convert string to array based on metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('array');

      expect(
        service.convertToAppValue(
          'log,error,warn',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error', 'warn']);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('array');
      expect(
        service.convertToAppValue(
          '["log","error","warn"]',
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error', 'warn']);
    });

    it('should handle enum values as strings', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      expect(
        service.convertToAppValue(
          'development',
          'NODE_ENV' as keyof ConfigVariables,
        ),
      ).toBe('development');
    });

    it('should handle various input types', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('boolean');
      expect(
        service.convertToAppValue(
          true,
          'AUTH_PASSWORD_ENABLED' as keyof ConfigVariables,
        ),
      ).toBe(true);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('number');
      expect(
        service.convertToAppValue(42, 'NODE_PORT' as keyof ConfigVariables),
      ).toBe(42);

      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce('array');
      expect(
        service.convertToAppValue(
          ['log', 'error'] as LogLevel[],
          'LOG_LEVELS' as keyof ConfigVariables,
        ),
      ).toEqual(['log', 'error']);
    });

    it('should fall back to default value approach when no metadata', () => {
      jest.spyOn(TypedReflect, 'getMetadata').mockReturnValueOnce(undefined);

      expect(
        service.convertToAppValue('42', 'NODE_PORT' as keyof ConfigVariables),
      ).toBe(42);
    });
  });

  describe('convertToStorageValue', () => {
    it('should handle primitive types directly', () => {
      expect(service.convertToStorageValue('string-value' as any)).toBe(
        'string-value',
      );
      expect(service.convertToStorageValue(42 as any)).toBe(42);
      expect(service.convertToStorageValue(true as any)).toBe(true);
      expect(service.convertToStorageValue(undefined as any)).toBe(null);
    });

    it('should handle arrays', () => {
      const array = ['log', 'error', 'warn'] as LogLevel[];

      expect(service.convertToStorageValue(array as any)).toEqual(array);
    });

    it('should handle objects', () => {
      const obj = { key: 'value' };

      expect(service.convertToStorageValue(obj as any)).toEqual(obj);
    });
  });
});
