import { ConfigVariablesMaskingStrategies } from 'src/engine/core-modules/twenty-config/enums/config-variables-masking-strategies.enum';
import { configVariableMaskSensitiveData } from 'src/engine/core-modules/twenty-config/utils/config-variable-mask-sensitive-data.util';

describe('configVariableMaskSensitiveData', () => {
  describe('LAST_N_CHARS strategy', () => {
    it('should mask all but the last 5 characters by default', () => {
      const result = configVariableMaskSensitiveData(
        'mysecretvalue123',
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe('********ue123');
    });

    it('should mask all but the specified number of characters', () => {
      const result = configVariableMaskSensitiveData(
        'mysecretvalue123',
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
        { chars: 3 },
      );

      expect(result).toBe('********123');
    });

    it('should return all asterisks if value is shorter than mask length', () => {
      const result = configVariableMaskSensitiveData(
        '123',
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
        { chars: 5 },
      );

      expect(result).toBe('********');
    });

    it('should handle empty string', () => {
      const result = configVariableMaskSensitiveData(
        '',
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe('');
    });
  });

  describe('HIDE_PASSWORD strategy', () => {
    it('should mask password in URL', () => {
      const result = configVariableMaskSensitiveData(
        'postgresql://user:password123@localhost:5432/db',
        ConfigVariablesMaskingStrategies.HIDE_PASSWORD,
      );

      expect(result).toBe('postgresql://********:********@localhost:5432/db');
    });

    it('should handle URL without password', () => {
      const result = configVariableMaskSensitiveData(
        'postgresql://localhost:5432/db',
        ConfigVariablesMaskingStrategies.HIDE_PASSWORD,
      );

      expect(result).toBe('postgresql://localhost:5432/db');
    });

    it('should throw error for invalid URLs', () => {
      expect(() =>
        configVariableMaskSensitiveData(
          'not-a-url',
          ConfigVariablesMaskingStrategies.HIDE_PASSWORD,
          { variableName: 'TEST_URL' },
        ),
      ).toThrow(
        'Invalid URL format for TEST_URL in HIDE_PASSWORD masking strategy',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle null value', () => {
      const result = configVariableMaskSensitiveData(
        null as any,
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBeNull();
    });

    it('should handle undefined value', () => {
      const result = configVariableMaskSensitiveData(
        undefined as any,
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBeUndefined();
    });

    it('should handle non-string value', () => {
      const result = configVariableMaskSensitiveData(
        123 as any,
        ConfigVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe(123);
    });
  });
});
