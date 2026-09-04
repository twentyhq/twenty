import { describe, expect, it } from 'vitest';

import { defineConnectionProvider } from '@/sdk/define';
import { type OAuthConnectionProviderIdentityConfig } from 'twenty-shared/application';

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
    // Catches the most common mistake: copy-pasting a slug or generated id
    // string instead of running `uuidgen`. Server-side throws too — this
    // arm of the check just shifts the error to `twenty deploy` time.
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

  const lifecycleHookKeys = [
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

  const validIdentity = {
    endpoint: 'https://api.linear.app/graphql',
    accountIdPath: 'data.viewer.id',
  } satisfies OAuthConnectionProviderIdentityConfig;

  const defineWithIdentity = (
    identity: OAuthConnectionProviderIdentityConfig,
  ) =>
    defineConnectionProvider({
      ...baseValidConfig,
      oauth: { ...baseValidConfig.oauth, identity },
    });

  it('accepts a valid identity block', () => {
    const result = defineWithIdentity({
      ...validIdentity,
      method: 'POST',
      body: '{"query":"{ viewer { id name } }"}',
      labelPath: 'data.viewer.name',
    });

    expect(result.success).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects an identity endpoint that is empty or not an https URL', () => {
    const missingEndpointResult = defineWithIdentity({
      ...validIdentity,
      endpoint: '',
    });

    expect(missingEndpointResult.success).toBe(false);
    expect(
      missingEndpointResult.errors.some((error) =>
        error.includes('must have an endpoint'),
      ),
    ).toBe(true);

    const insecureEndpointResult = defineWithIdentity({
      ...validIdentity,
      endpoint: 'http://api.linear.app/graphql',
    });

    expect(insecureEndpointResult.success).toBe(false);
    expect(
      insecureEndpointResult.errors.some((error) =>
        error.includes('must be an absolute https URL'),
      ),
    ).toBe(true);

    const credentialsEndpointResult = defineWithIdentity({
      ...validIdentity,
      endpoint: 'https://user:pass@api.linear.app/graphql',
    });

    expect(credentialsEndpointResult.success).toBe(false);
  });

  it('rejects an identity accountIdPath that is only whitespace', () => {
    const result = defineWithIdentity({
      ...validIdentity,
      accountIdPath: '   ',
    });

    expect(result.success).toBe(false);
    expect(result.errors.some((error) => error.includes('accountIdPath'))).toBe(
      true,
    );
  });

  it('rejects an unsupported identity method', () => {
    const result = defineWithIdentity({
      ...validIdentity,
      // @ts-expect-error verifies runtime validation for JavaScript callers.
      method: 'PUT',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) =>
        error.includes('identity method "PUT" is not supported'),
      ),
    ).toBe(true);
  });

  it('rejects an identity body when the method is GET', () => {
    const result = defineWithIdentity({
      ...validIdentity,
      body: '{"query":"{ viewer { id } }"}',
    });

    expect(result.success).toBe(false);
    expect(
      result.errors.some((error) => error.includes("Set `method: 'POST'`")),
    ).toBe(true);
  });
});
