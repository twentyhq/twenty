import { normalizeGQLField } from '~/utils/normalizeGQLField';

describe('normalizeGQLField', () => {
  it('should produce consistent output for the same fields', () => {
    const resultA = normalizeGQLField('id name');
    const resultB = normalizeGQLField('id name');

    expect(resultA).toBe(resultB);
  });

  it('should produce the same output regardless of whitespace', () => {
    const resultA = normalizeGQLField('id   name    email');
    const resultB = normalizeGQLField('id name email');

    expect(resultA).toBe(resultB);
  });

  it('should return a string', () => {
    const result = normalizeGQLField('id name');

    expect(typeof result).toBe('string');
  });
});
