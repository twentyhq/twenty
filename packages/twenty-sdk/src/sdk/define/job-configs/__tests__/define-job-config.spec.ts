import { defineJobConfig } from '@/sdk/define';

describe('defineJobConfig', () => {
  it('should accept a key and a limiter', () => {
    const config = {
      key: 'fireflies-api',
      limiter: { max: 50, durationMs: 60_000 },
    };

    const result = defineJobConfig(config);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(config);
  });

  it.each(['', 'has space', 'a'.repeat(65)])(
    'should reject the key "%s"',
    (key) => {
      const result = defineJobConfig({
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
    const result = defineJobConfig({ key: 'api', limiter });

    expect(result.success).toBe(false);
    expect(result.errors.join()).toContain(expectedError);
  });
});
