import { plainToClass } from 'class-transformer';

import { CastToUpperSnakeCase } from 'src/engine/core-modules/twenty-config/decorators/cast-to-upper-snake-case.decorator';

class TestClass {
  @CastToUpperSnakeCase()
  value: string;
}

describe('CastToUpperSnakeCase Decorator', () => {
  it('should transform lowercase string to UPPER_SNAKE_CASE', () => {
    const result = plainToClass(TestClass, { value: 'local' });

    expect(result.value).toBe('LOCAL');
  });

  it('should transform camelCase string to UPPER_SNAKE_CASE', () => {
    const result = plainToClass(TestClass, { value: 'camelCase' });

    expect(result.value).toBe('CAMEL_CASE');
  });

  it('should transform kebab-case string to UPPER_SNAKE_CASE', () => {
    const result = plainToClass(TestClass, { value: 'kebab-case' });

    expect(result.value).toBe('KEBAB_CASE');
  });

  it('should transform space-separated string to UPPER_SNAKE_CASE', () => {
    const result = plainToClass(TestClass, { value: 'space separated' });

    expect(result.value).toBe('SPACE_SEPARATED');
  });

  it('should handle already UPPER_SNAKE_CASE string', () => {
    const result = plainToClass(TestClass, { value: 'ALREADY_UPPER_SNAKE' });

    expect(result.value).toBe('ALREADY_UPPER_SNAKE');
  });

  it('should handle mixed case with numbers', () => {
    const result = plainToClass(TestClass, { value: 'test123Value' });

    expect(result.value).toBe('TEST_123_VALUE');
  });

  it('should trim whitespace', () => {
    const result = plainToClass(TestClass, { value: '  local  ' });

    expect(result.value).toBe('LOCAL');
  });

  it('should handle empty string', () => {
    const result = plainToClass(TestClass, { value: '' });

    expect(result.value).toBe('');
  });

  it('should return undefined for non-string values', () => {
    const result = plainToClass(TestClass, { value: 123 });

    expect(result.value).toBeUndefined();
  });

  it('should return undefined for null values', () => {
    const result = plainToClass(TestClass, { value: null });

    expect(result.value).toBeUndefined();
  });

  it('should return undefined for undefined values', () => {
    const result = plainToClass(TestClass, { value: undefined });

    expect(result.value).toBeUndefined();
  });

  it('should handle complex mixed formats', () => {
    const result = plainToClass(TestClass, {
      value: 'Complex-Mixed_Format test123',
    });

    expect(result.value).toBe('COMPLEX_MIXED_FORMAT_TEST_123');
  });
});
