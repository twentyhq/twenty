import { defineApplication } from '@/sdk/define';

describe('defineApplication', () => {
  it('should return successful validation result when valid', () => {
    const config = {
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      defaultRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    };

    const result = defineApplication(config);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(config);
    expect(result.errors).toEqual([]);
  });

  it('should pass through all optional fields', () => {
    const config = {
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      applicationVariables: {
        API_KEY: {
          universalIdentifier: '3a327392-3a0f-4605-9223-0633f063eaf6',
          description: 'API Key',
          isSecret: true,
        },
      },
      defaultRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    };

    const result = defineApplication(config);

    expect(result.success).toBe(true);
    expect(result.config).toEqual(config);
    expect(result.config?.applicationVariables).toBeDefined();
    expect(result.config?.defaultRoleUniversalIdentifier).toBe(
      '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    );
  });

  it('should accept config without defaultRoleUniversalIdentifier (auto-wired by defineApplicationRole)', () => {
    const config = {
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
    };

    const result = defineApplication(config);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.warnings).toEqual([]);
    expect(result.config?.defaultRoleUniversalIdentifier).toBeUndefined();
  });

  it('should warn that defaultRoleUniversalIdentifier is deprecated when provided', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      defaultRoleUniversalIdentifier: '68bb56f3-8300-4cb5-8cc3-8da9ee66f1b2',
    });

    const warnings = result.warnings ?? [];

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/deprecated/i);
    expect(warnings[0]).toMatch(/defineApplicationRole/);
  });

  it('should return error when universalIdentifier is missing', () => {
    const config = {
      displayName: 'My App',
    };

    const result = defineApplication(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Application must have a universalIdentifier',
    );
  });

  it('should return error when universalIdentifier is empty string', () => {
    const config = {
      universalIdentifier: '',
      displayName: 'My App',
    };

    const result = defineApplication(config as any);

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Application must have a universalIdentifier',
    );
  });
});
