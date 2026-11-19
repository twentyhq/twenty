import { defineJobConfig } from '@/sdk/define';

const UNIVERSAL_IDENTIFIER = 'e1d3f6a2-7b4c-4e8d-9a1f-2c3b4d5e6f70';

describe('defineJobConfig', () => {
  it('should accept a key and a limiter', () => {
    const config = {
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      key: 'fireflies-api',
      limiter: { max: 50, durationMs: 60_000 },
    };

    const result = defineJobConfig(config);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(config);
  });

  it('should reject a missing universalIdentifier', () => {
    const result = defineJobConfig({
      universalIdentifier: '',
      key: 'api',
      limiter: { max: 1, durationMs: 1_000 },
    });

    expect(result.success).toBe(false);
    expect(result.errors[0]).toContain('universalIdentifier');
  });

  it.each(['', 'has space', 'a'.repeat(65)])(
    'should reject the key "%s"',
    (key) => {
      const result = defineJobConfig({
        universalIdentifier: UNIVERSAL_IDENTIFIER,
        key,
        limiter: { max: 1, durationMs: 1_000 },
      });

      expect(result.success).toBe(false);
      expect(result.errors[0]).toContain('Job config key must match');
    },
  );

  it.each([
    [{ max: 0, durationMs: 1_000 }, 'limiter max'],
    [{ max: 1.5, durationMs: 1_000 }, 'limiter max'],
    [{ max: 1, durationMs: 0 }, 'limiter durationMs'],
  ])('should reject the limiter %j', (limiter, expectedError) => {
    const result = defineJobConfig({
      universalIdentifier: UNIVERSAL_IDENTIFIER,
      key: 'api',
      limiter,
    });

    expect(result.success).toBe(false);
    expect(result.errors.join()).toContain(expectedError);
  });
});
