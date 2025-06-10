import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';

describe('configTransformers', () => {
  describe('boolean', () => {
    it('should handle true values correctly', () => {
      expect(configTransformers.boolean(true)).toBe(true);
      expect(configTransformers.boolean('true')).toBe(true);
      expect(configTransformers.boolean('True')).toBe(true);
      expect(configTransformers.boolean('yes')).toBe(true);
      expect(configTransformers.boolean('on')).toBe(true);
      expect(configTransformers.boolean('1')).toBe(true);
      expect(configTransformers.boolean(1)).toBe(true);
    });

    it('should handle false values correctly', () => {
      expect(configTransformers.boolean(false)).toBe(false);
      expect(configTransformers.boolean('false')).toBe(false);
      expect(configTransformers.boolean('False')).toBe(false);
      expect(configTransformers.boolean('no')).toBe(false);
      expect(configTransformers.boolean('off')).toBe(false);
      expect(configTransformers.boolean('0')).toBe(false);
      expect(configTransformers.boolean(0)).toBe(false);
    });

    it('should return undefined for invalid values', () => {
      expect(configTransformers.boolean('invalid')).toBeUndefined();
      expect(configTransformers.boolean('random_string')).toBeUndefined();
      expect(configTransformers.boolean({})).toBeUndefined();
      expect(configTransformers.boolean([])).toBeUndefined();
    });

    it('should handle null and undefined', () => {
      expect(configTransformers.boolean(null)).toBeUndefined();
      expect(configTransformers.boolean(undefined)).toBeUndefined();
    });
  });

  describe('number', () => {
    it('should handle valid number values', () => {
      expect(configTransformers.number(42)).toBe(42);
      expect(configTransformers.number('42')).toBe(42);
      expect(configTransformers.number('-42')).toBe(-42);
      expect(configTransformers.number('3.14')).toBe(3.14);
      expect(configTransformers.number('0')).toBe(0);
    });

    it('should handle boolean values', () => {
      expect(configTransformers.number(true)).toBe(1);
      expect(configTransformers.number(false)).toBe(0);
    });

    it('should return undefined for invalid values', () => {
      expect(configTransformers.number('invalid')).toBeUndefined();
      expect(configTransformers.number('forty-two')).toBeUndefined();
      expect(configTransformers.number({})).toBeUndefined();
      expect(configTransformers.number([])).toBeUndefined();
    });

    it('should handle null and undefined', () => {
      expect(configTransformers.number(null)).toBeUndefined();
      expect(configTransformers.number(undefined)).toBeUndefined();
    });
  });

  describe('string', () => {
    it('should handle string values', () => {
      expect(configTransformers.string('test')).toBe('test');
      expect(configTransformers.string('')).toBe('');
    });

    it('should convert numbers to strings', () => {
      expect(configTransformers.string(42)).toBe('42');
      expect(configTransformers.string(0)).toBe('0');
      expect(configTransformers.string(3.14)).toBe('3.14');
    });

    it('should convert booleans to strings', () => {
      expect(configTransformers.string(true)).toBe('true');
      expect(configTransformers.string(false)).toBe('false');
    });

    it('should convert arrays and objects to JSON strings', () => {
      expect(configTransformers.string(['a', 'b', 'c'])).toBe('["a","b","c"]');
      expect(configTransformers.string({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    });

    it('should handle null and undefined', () => {
      expect(configTransformers.string(null)).toBeUndefined();
      expect(configTransformers.string(undefined)).toBeUndefined();
    });

    it('should handle failed JSON stringification', () => {
      const circular: any = {};

      circular.self = circular;

      expect(configTransformers.string(circular)).toBeUndefined();
    });
  });
});
