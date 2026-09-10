import { hasDangerousUrlScheme } from '../hasDangerousUrlScheme';

describe('hasDangerousUrlScheme', () => {
  it('should detect javascript, data and vbscript schemes', () => {
    expect(hasDangerousUrlScheme('javascript:alert(1)')).toBe(true);
    expect(hasDangerousUrlScheme('data:text/html,<script>')).toBe(true);
    expect(hasDangerousUrlScheme('vbscript:msgbox(1)')).toBe(true);
  });

  it('should ignore casing', () => {
    expect(hasDangerousUrlScheme('JavaScript:alert(1)')).toBe(true);
  });

  it('should see through leading and interior control-character obfuscation', () => {
    expect(hasDangerousUrlScheme('  javascript:alert(1)')).toBe(true);
    expect(hasDangerousUrlScheme('java\tscript:alert(1)')).toBe(true);
    expect(hasDangerousUrlScheme('javascript:alert(1)')).toBe(true);
  });

  it('should allow safe schemes and relative urls', () => {
    expect(hasDangerousUrlScheme('https://twenty.com')).toBe(false);
    expect(hasDangerousUrlScheme('mailto:hi@twenty.com')).toBe(false);
    expect(hasDangerousUrlScheme('/relative/path')).toBe(false);
    expect(hasDangerousUrlScheme('#anchor')).toBe(false);
    expect(hasDangerousUrlScheme('blob:https://twenty.com/abc')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(hasDangerousUrlScheme(undefined)).toBe(false);
    expect(hasDangerousUrlScheme(123)).toBe(false);
    expect(hasDangerousUrlScheme({})).toBe(false);
  });
});
