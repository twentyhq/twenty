import { defineJobGroup } from '@/sdk/define';

const UNIVERSAL_IDENTIFIER = 'e1d3f6a2-7b4c-4e8d-9a1f-2c3b4d5e6f70';

describe('defineJobGroup', () => {
  it('should accept a name and a limiter', () => {
    const config = {
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      name: 'fireflies-api',
      limiter: { max: 50, durationMs: 60_000 },
    };

    const result = defineJobGroup(config);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(config);
  });

  it('should reject a missing universalIdentifier', () => {
    const result = defineJobGroup({
      universalIdentifier: '',
      name: 'api',
      limiter: { max: 1, durationMs: 1_000 },
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('universalIdentifier');
  });

  it('should reject a blank name', () => {
    const result = defineJobGroup({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      name: '  ',
      limiter: { max: 1, durationMs: 1_000 },
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('non-empty name');
  });

  it.each([
    { max: 0, durationMs: 1_000 },
    { max: 1.5, durationMs: 1_000 },
    { max: 1, durationMs: 0 },
  ])('should reject the limiter %j', (limiter) => {
    const result = defineJobGroup({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      name: 'api',
      limiter,
    });

    expect(result.success).toBe(false);
    expect(result.errors.join()).toContain('limiter max must be');
  });
});
