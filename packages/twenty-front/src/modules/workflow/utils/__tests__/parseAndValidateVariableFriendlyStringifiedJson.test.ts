import { parseAndValidateVariableFriendlyStringifiedJson } from '@/workflow/utils/parseAndValidateVariableFriendlyStringifiedJson';

describe('parseAndValidateVariableFriendlyStringifiedJson', () => {
  describe('Valid JSON with variable-friendly keys', () => {
    it('should accept empty object', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson('{}');

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({});
    });

    it('should accept object with camelCase keys', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"camelCaseKey": "value", "anotherKey": 123}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        camelCaseKey: 'value',
        anotherKey: 123,
      });
    });

    it('should accept object with snake_case keys', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"snake_case_key": "value", "another_key": true}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        snake_case_key: 'value',
        another_key: true,
      });
    });

    it('should accept keys with dashes and special characters', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"key-with-dashes": "value", "key.with.dots": "another", "key$symbol": 42}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        'key-with-dashes': 'value',
        'key.with.dots': 'another',
        key$symbol: 42,
      });
    });

    it('should accept numeric keys', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"123": "numeric", "456key": "mixed"}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        '123': 'numeric',
        '456key': 'mixed',
      });
    });

    it('should accept complex nested values', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"user": {"name": "John", "age": 30}, "items": [1, 2, 3]}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        user: { name: 'John', age: 30 },
        items: [1, 2, 3],
      });
    });
  });

  describe('Invalid keys with whitespace', () => {
    it('should reject key with space', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"key with space": "value"}',
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('JSON keys cannot contain spaces');
    });

    it('should reject key with leading space', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{" leadingSpace": "value"}',
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('JSON keys cannot contain spaces');
    });

    it('should reject key with trailing space', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"trailingSpace ": "value"}',
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('JSON keys cannot contain spaces');
    });

    it('should reject key with tab character', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"key\\twith\\ttab": "value"}',
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('JSON keys cannot contain spaces');
    });

    it('should reject when one of multiple keys has space', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"validKey": "value", "invalid key": "another"}',
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('JSON keys cannot contain spaces');
    });
  });

  describe('Malformed JSON', () => {
    it('should reject invalid JSON syntax', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('{"key": value}');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unexpected token');
    });

    it('should reject unclosed object', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('{"key": "value"');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain(
        "SyntaxError: Expected ',' or '}' after property value in JSON at position 15 (line 1 column 16)",
      );
    });

    it('should reject empty string', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson('');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unexpected end of JSON input');
    });

    it('should reject non-JSON string', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('not json at all');

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unexpected token');
    });
  });

  describe('Non-object JSON values', () => {
    it('should reject JSON array', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('[1, 2, 3]');

      expect(result.isValid).toBe(false);
    });

    it('should reject JSON string', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('"just a string"');

      expect(result.isValid).toBe(false);
    });

    it('should reject JSON number', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson('42');

      expect(result.isValid).toBe(false);
    });

    it('should reject JSON boolean', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson('true');

      expect(result.isValid).toBe(false);
    });

    it('should reject JSON null', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson('null');

      expect(result.isValid).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should accept empty string key', () => {
      const result =
        parseAndValidateVariableFriendlyStringifiedJson('{"": "value"}');

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({ '': 'value' });
    });

    it('should handle deeply nested objects', () => {
      const result = parseAndValidateVariableFriendlyStringifiedJson(
        '{"level1": {"level2": {"level3": "deep"}}}',
      );

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual({
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      });
    });
  });
});
