import { describe, expect, it } from 'vitest';

import { GRANOLA_CONNECTION_STATUS_SCHEMA } from 'src/front-components/types/granola-connection-status.type';
import { isGranolaConnectionReady } from 'src/front-components/utils/is-granola-connection-ready.util';

describe('isGranolaConnectionReady', () => {
  it('requires an accepted key and an active registration', () => {
    expect(
      isGranolaConnectionReady(
        GRANOLA_CONNECTION_STATUS_SCHEMA.parse({
          isConnected: true,
          isApiKeySet: true,
          registration: { scopes: ['workspace'], isActive: true },
        }),
      ),
    ).toBe(true);
  });

  it.each([
    { registration: undefined },
    { registration: { scopes: ['workspace'], isActive: false } },
    { needsRegistration: true },
    { isConnected: false },
    { isGranolaReachable: false },
    { error: 'Connection failed' },
  ])(
    'does not show connected for an incomplete or failed connection: %j',
    (overrides) => {
      expect(
        isGranolaConnectionReady(
          GRANOLA_CONNECTION_STATUS_SCHEMA.parse({
            isConnected: true,
            isApiKeySet: true,
            registration: { scopes: ['workspace'], isActive: true },
            ...overrides,
          }),
        ),
      ).toBe(false);
    },
  );
});
