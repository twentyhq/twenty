import { describe, expect, it } from 'vitest';

import { defineConnectionProvider } from '@/sdk/define';

const baseValidConfig = {
  universalIdentifier: '99fcd8e8-fbb1-4d2c-bc16-7c61ef3eaaaa',
  name: 'linear',
  displayName: 'Linear',
  type: 'oauth' as const,
  oauth: {
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    scopes: ['read', 'write'],
    clientIdVariable: 'LINEAR_CLIENT_ID',
    clientSecretVariable: 'LINEAR_CLIENT_SECRET',
  },
};

describe('defineConnectionProvider', () => {
  it('returns success for a valid config', () => {
    const result = defineConnectionProvider(baseValidConfig);

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('reports a missing universalIdentifier', () => {
    const result = defineConnectionProvider({
      ...baseValidConfig,
      universalIdentifier: '',
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Connection provider must have a universalIdentifier',
    );
  });

  it('rejects a non-UUID universalIdentifier', () => {
    const result = defineConnectionProvider({
      ...baseValidConfig,
      universalIdentifier: 'linear-provider',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) => error.includes('must be a UUID')),
    ).toBe(true);
  });

  it('accepts UUID v1, v4, and v5', () => {
    // Postgres `uuid` is version-agnostic — make sure the SDK regex matches.
    const versions = [
      // v1
      'b648f87b-1d26-1961-b974-0908fd991061',
      // v4
      'b648f87b-1d26-4961-b974-0908fd991061',
      // v5
      'b648f87b-1d26-5961-b974-0908fd991061',
      // Nil UUID
      '00000000-0000-0000-0000-000000000000',
    ];

    for (const universalIdentifier of versions) {
      const result = defineConnectionProvider({
        ...baseValidConfig,
        universalIdentifier,
      });

      expect(result.success).toBe(true);
    }
  });

  it('rejects a UUID with surrounding whitespace', () => {
    const result = defineConnectionProvider({
      ...baseValidConfig,
      universalIdentifier: ' b648f87b-1d26-4961-b974-0908fd991061 ',
    });

    expect(result.success).toBe(false);
  });

  it.each(['WORKSPACE', 'USER'] as const)('accepts the %s scope', (scope) => {
    const result = defineConnectionProvider({ ...baseValidConfig, scope });

    expect(result.success).toBe(true);
    expect(result.config.scope).toBe(scope);
  });

  it('rejects an unknown scope', () => {
    const result = defineConnectionProvider({
      ...baseValidConfig,
      scope: 'WORKSPACE_MEMBER' as never,
    });

    expect(result.success).toBe(false);
    expect(result.errors).toContain(
      'Connection provider scope must be one of WORKSPACE, USER',
    );
  });

  const lifecycleHookKeys = [
    'identifyAccountLogicFunction',
    'onConnectLogicFunction',
    'onDisconnectLogicFunction',
  ] as const;

  it.each(lifecycleHookKeys)('accepts a valid %s', (lifecycleHookKey) => {
    const result = defineConnectionProvider({
      ...baseValidConfig,
      [lifecycleHookKey]: {
        universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
      },
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it.each(lifecycleHookKeys)(
    'rejects a non-UUID %s universalIdentifier',
    (lifecycleHookKey) => {
      const result = defineConnectionProvider({
        ...baseValidConfig,
        [lifecycleHookKey]: { universalIdentifier: 'not-a-uuid' },
      });

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) => error.includes(lifecycleHookKey)),
      ).toBe(true);
    },
  );

  describe('custom type', () => {
    const baseCustomConfig = {
      universalIdentifier: '99fcd8e8-fbb1-4d2c-bc16-7c61ef3ebbbb',
      name: 'linkedin',
      displayName: 'LinkedIn',
      type: 'custom' as const,
      custom: {
        authorizeLogicFunction: {
          universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
        },
        callbackLogicFunction: {
          universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991062',
        },
      },
    };

    it('returns success for a valid config', () => {
      const result = defineConnectionProvider(baseCustomConfig);

      expect(result.success).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('reports a missing custom config block', () => {
      const result = defineConnectionProvider({
        ...baseCustomConfig,
        custom: undefined as never,
      });

      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        "Connection provider with type 'custom' must declare a `custom` config block",
      );
    });

    it.each(['authorizeLogicFunction', 'callbackLogicFunction'] as const)(
      'reports a missing custom.%s',
      (logicFunctionKey) => {
        const result = defineConnectionProvider({
          ...baseCustomConfig,
          custom: {
            ...baseCustomConfig.custom,
            [logicFunctionKey]: undefined as never,
          },
        });

        expect(result.success).toBe(false);
        expect(result.errors).toContain(
          `Custom connection provider must declare custom.${logicFunctionKey}`,
        );
      },
    );

    it('rejects a non-UUID logic function reference', () => {
      const result = defineConnectionProvider({
        ...baseCustomConfig,
        custom: {
          ...baseCustomConfig.custom,
          callbackLogicFunction: { universalIdentifier: 'linkedin-callback' },
        },
      });

      expect(result.success).toBe(false);
      expect(
        result.errors.some((error) =>
          error.includes('custom.callbackLogicFunction.universalIdentifier'),
        ),
      ).toBe(true);
    });
  });
});
