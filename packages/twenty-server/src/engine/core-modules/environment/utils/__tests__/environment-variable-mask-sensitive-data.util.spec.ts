import { EnvironmentVariablesMaskingStrategies } from 'src/engine/core-modules/environment/enums/environment-variables-masking-strategies.enum';
import { environmentVariableMaskSensitiveData } from 'src/engine/core-modules/environment/utils/environment-variable-mask-sensitive-data.util';

describe('environmentVariableMaskSensitiveData', () => {
  describe('LAST_N_CHARS strategy', () => {
    it('should mask all but the last 5 characters by default', () => {
      const result = environmentVariableMaskSensitiveData(
        'mysecretvalue123',
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe('********ue123');
    });

    it('should mask all but the specified number of characters', () => {
      const result = environmentVariableMaskSensitiveData(
        'mysecretvalue123',
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
        { chars: 3 },
      );

      expect(result).toBe('********123');
    });

    it('should return all asterisks if value is shorter than mask length', () => {
      const result = environmentVariableMaskSensitiveData(
        '123',
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
        { chars: 5 },
      );

      expect(result).toBe('********');
    });

    it('should handle empty string', () => {
      const result = environmentVariableMaskSensitiveData(
        '',
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe('');
    });
  });

  describe('HIDE_PASSWORD strategy', () => {
    it('should mask password in URL', () => {
      const result = environmentVariableMaskSensitiveData(
        'postgresql://user:password123@localhost:5432/db',
        EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
      );

      expect(result).toBe('postgresql://********:********@localhost:5432/db');
    });

    it('should handle URL without password', () => {
      const result = environmentVariableMaskSensitiveData(
        'postgresql://localhost:5432/db',
        EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
      );

      expect(result).toBe('postgresql://localhost:5432/db');
    });

    it('should throw error for invalid URLs', () => {
      expect(() =>
        environmentVariableMaskSensitiveData(
          'not-a-url',
          EnvironmentVariablesMaskingStrategies.HIDE_PASSWORD,
          { variableName: 'TEST_URL' },
        ),
      ).toThrow(
        'Invalid URL format for TEST_URL in HIDE_PASSWORD masking strategy',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle null value', () => {
      const result = environmentVariableMaskSensitiveData(
        null as any,
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBeNull();
    });

    it('should handle undefined value', () => {
      const result = environmentVariableMaskSensitiveData(
        undefined as any,
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBeUndefined();
    });

    it('should handle non-string value', () => {
      const result = environmentVariableMaskSensitiveData(
        123 as any,
        EnvironmentVariablesMaskingStrategies.LAST_N_CHARS,
      );

      expect(result).toBe(123);
    });
  });
});
