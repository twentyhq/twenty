import { defineHealthCheck } from '@/sdk/define';

describe('defineHealthCheck', () => {
  const validConfig = {
    universalIdentifier: '7f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
    name: 'health-check',
    handler: async () => ({ status: 'OK' as const }),
  };

  it('should return successful validation result when valid', () => {
    const result = defineHealthCheck(validConfig);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(validConfig);
    expect(result.errors).toEqual([]);
  });

  it('should return error when universalIdentifier is missing', () => {
    const result = defineHealthCheck({
      name: 'health-check',
      handler: async () => ({ status: 'OK' as const }),
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Health check must have a universalIdentifier',
    );
  });

  it('should return error when handler is missing', () => {
    const result = defineHealthCheck({
      universalIdentifier: '7f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
      name: 'health-check',
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toEqual(['Health check must have a handler']);
  });

  it('should return error when handler is not a function', () => {
    const result = defineHealthCheck({
      universalIdentifier: '7f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f',
      name: 'health-check',
      handler: 'not-a-function',
    } as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain('Health check handler must be a function');
  });
});
