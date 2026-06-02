import { computeHashedResourceName } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/compute-hashed-resource-name';

describe('computeHashedResourceName', () => {
  it('returns prefix concatenated with a 12-character sha256 hex checksum of the contents', () => {
    const name = computeHashedResourceName({
      prefix: 'twenty-builder',
      contents: ['handler-code'],
    });

    expect(name).toMatch(/^twenty-builder-[0-9a-f]{12}$/);
  });

  it('updates the hash with each content chunk in order', () => {
    const merged = computeHashedResourceName({
      prefix: 'p',
      contents: ['abc', 'def'],
    });
    const combined = computeHashedResourceName({
      prefix: 'p',
      contents: ['abcdef'],
    });

    expect(merged).toBe(combined);
  });

  it('produces different names for different prefixes with identical contents', () => {
    const a = computeHashedResourceName({
      prefix: 'a',
      contents: ['x'],
    });
    const b = computeHashedResourceName({
      prefix: 'b',
      contents: ['x'],
    });

    expect(a).not.toBe(b);
    expect(a.slice(2)).toBe(b.slice(2));
  });

  it('returns the same value across calls (deterministic)', () => {
    const args = { prefix: 'prefix', contents: ['payload'] };

    expect(computeHashedResourceName(args)).toBe(
      computeHashedResourceName(args),
    );
  });
});
