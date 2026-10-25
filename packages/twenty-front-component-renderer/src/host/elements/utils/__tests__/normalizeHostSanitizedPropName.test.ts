import { normalizeHostSanitizedPropName } from '../normalizeHostSanitizedPropName';

describe('normalizeHostSanitizedPropName', () => {
  it('should lowercase any casing of a host-sanitized prop name', () => {
    expect(normalizeHostSanitizedPropName('SANDBOX')).toBe('sandbox');
    expect(normalizeHostSanitizedPropName('Sandbox')).toBe('sandbox');
    expect(normalizeHostSanitizedPropName('STYLE')).toBe('style');
  });

  it('should keep a host-sanitized prop name already in canonical casing', () => {
    expect(normalizeHostSanitizedPropName('sandbox')).toBe('sandbox');
    expect(normalizeHostSanitizedPropName('style')).toBe('style');
  });

  it('should keep the casing of other prop names', () => {
    expect(normalizeHostSanitizedPropName('srcDoc')).toBe('srcDoc');
    expect(normalizeHostSanitizedPropName('className')).toBe('className');
    expect(normalizeHostSanitizedPropName('viewBox')).toBe('viewBox');
  });
});
