import { MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT } from 'twenty-shared/application';

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
    expect(result.config).toEqual({
      ...config,
      logo: undefined,
      galleryImages: [],
    });
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
    expect(result.config).toEqual({
      ...config,
      logo: undefined,
      galleryImages: [],
    });
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

  it('should warn when category is not a known ApplicationCategory', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      category: 'NotARealCategory',
    });

    const warnings = result.warnings ?? [];

    expect(result.success).toBe(true);
    expect(
      warnings.some((warning) => warning.includes('NotARealCategory')),
    ).toBe(true);
  });

  it('should not warn when category is a known ApplicationCategory', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      category: 'Data',
    });

    expect(result.warnings ?? []).toEqual([]);
  });

  it('should warn when a server variable is both required and deprecated', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      serverVariables: {
        API_KEY: { isRequired: true, isDeprecated: true },
      },
    });

    const warnings = result.warnings ?? [];

    expect(result.success).toBe(true);
    expect(warnings.some((warning) => warning.includes('API_KEY'))).toBe(true);
  });

  it('should warn when an application variable is both required and deprecated', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      applicationVariables: {
        TENANT_ID: { isRequired: true, isDeprecated: true },
      },
    });

    const warnings = result.warnings ?? [];

    expect(result.success).toBe(true);
    expect(warnings.some((warning) => warning.includes('TENANT_ID'))).toBe(true);
  });

  it('should accept a billable operation mapped to a known operationType', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        operations: {
          recordMeeting: {
            operationType: 'CALL_RECORDING',
            label: 'Meeting recording',
          },
        },
      },
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return error when a billable operation maps to an unknown operationType', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        operations: {
          recordMeeting: {
            operationType: 'MEETING_RECORDING' as never,
            label: 'Meeting recording',
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(
      (result.errors ?? []).some((error) => error.includes('recordMeeting')),
    ).toBe(true);
  });

  it('should return error when a billable operation has an empty label', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        operations: {
          recordMeeting: { operationType: 'CALL_RECORDING', label: '' },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Billable operation "recordMeeting" must have a non empty label',
    );
  });

  it('should accept a flat and a per member recurring charge', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          platformFee: {
            period: 'MONTH',
            amountMicroCredits: 20_000_000,
            label: 'Platform fee',
          },
          seat: {
            period: 'MONTH',
            amountMicroCredits: 5_000_000,
            per: 'WORKSPACE_MEMBER',
            label: 'Per member',
          },
        },
      },
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('should return error when a recurring charge has an unknown period', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          platformFee: {
            period: 'WEEK' as never,
            amountMicroCredits: 20_000_000,
            label: 'Platform fee',
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(
      (result.errors ?? []).some((error) => error.includes('platformFee')),
    ).toBe(true);
  });

  it('should return error when a recurring charge amount is not a positive integer', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          platformFee: {
            period: 'MONTH',
            amountMicroCredits: 0,
            label: 'Platform fee',
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Recurring charge "platformFee" must have a positive integer amountMicroCredits',
    );
  });

  it('should return error when a recurring charge amount exceeds the per unit maximum', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          platformFee: {
            period: 'MONTH',
            amountMicroCredits: MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT + 1,
            label: 'Platform fee',
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors?.[0]).toContain(
      'exceeds the maximum amountMicroCredits',
    );
  });

  it('should accept a recurring charge amount exactly at the per unit maximum', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          platformFee: {
            period: 'MONTH',
            amountMicroCredits: MAX_RECURRING_CHARGE_MICRO_CREDITS_PER_UNIT,
            label: 'Platform fee',
          },
        },
      },
    });

    expect(result.success).toBe(true);
  });

  it('should return error when a name is both a recurring charge and a billable operation', () => {
    const result = defineApplication({
      universalIdentifier: 'a9faf5f8-cf7e-4f24-9d37-fd523c30febe',
      displayName: 'My App',
      description: 'My app description',
      billing: {
        recurring: {
          recordMeeting: {
            period: 'MONTH',
            amountMicroCredits: 20_000_000,
            label: 'Platform fee',
          },
        },
        operations: {
          recordMeeting: {
            operationType: 'CALL_RECORDING',
            label: 'Meeting recording',
          },
        },
      },
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      '"recordMeeting" is declared both as a recurring charge and as a billable operation. Give them distinct names.',
    );
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
