import { type HttpRequestBody } from '@/workflow/workflow-steps/workflow-actions/http-request-action/constants/HttpRequest';
import { shouldDisplayRawJsonByDefault } from '@/workflow/workflow-steps/workflow-actions/http-request-action/utils/shouldDisplayRawJsonByDefault';

describe('shouldDisplayRawJsonByDefault', () => {
  describe('when defaultValue is undefined', () => {
    it('should return false', () => {
      expect(shouldDisplayRawJsonByDefault(undefined)).toBe(false);
    });
  });

  describe('when defaultValue is a string', () => {
    describe('when string contains valid JSON with only string values', () => {
      it('should return false for simple object', () => {
        const defaultValue = '{"key1": "value1", "key2": "value2"}';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(false);
      });

      it('should return true for nested object with only string values', () => {
        const defaultValue = '{"key1": "value1", "nested": {"key2": "value2"}}';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return false for array with only string values', () => {
        const defaultValue = '["value1", "value2", "value3"]';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(false);
      });

      it('should return true for empty object', () => {
        const defaultValue = '{}';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for empty array', () => {
        const defaultValue = '[]';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });
    });

    describe('when string is not valid JSON', () => {
      it('should return true for invalid JSON string', () => {
        const defaultValue = 'invalid json string';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for malformed JSON', () => {
        const defaultValue = '{"key1": "value1", "key2":}';
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });
    });
  });

  describe('when defaultValue is an HttpRequestBody object', () => {
    describe('when object has non-string values', () => {
      it('should return true for object with number values', () => {
        const defaultValue: HttpRequestBody = { key1: 'value1', key2: 123 };
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for object with boolean values', () => {
        const defaultValue: HttpRequestBody = { key1: 'value1', key2: true };
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for object with null values', () => {
        const defaultValue: HttpRequestBody = { key1: 'value1', key2: null };
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for object with array values', () => {
        const defaultValue: HttpRequestBody = {
          key1: 'value1',
          key2: [1, 'two', true, null],
        };
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });

      it('should return true for object with mixed types', () => {
        const defaultValue: HttpRequestBody = {
          key1: 'value1',
          key2: 123,
          key3: true,
          key4: null,
          key5: ['array', 'values'],
        };
        expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle complex nested structures', () => {
      const defaultValue = JSON.stringify({
        level1: {
          level2: {
            stringValue: 'test',
            numberValue: 42,
            booleanValue: true,
            nullValue: null,
            arrayValue: [1, 'two', false],
          },
        },
      });
      expect(shouldDisplayRawJsonByDefault(defaultValue)).toBe(true);
    });
  });
});
