import { describe, expect, it } from 'vitest';

import { GRANOLA_CONNECTION_STATUS_SCHEMA } from 'src/front-components/types/granola-connection-status.type';
import { computeGranolaConnectionState } from 'src/front-components/utils/compute-granola-connection-state.util';

const READY_STATUS = {
  isConnected: true,
  isApiKeySet: true,
  registration: { scopes: ['workspace'], isActive: true },
};

describe('computeGranolaConnectionState', () => {
  it('shows connected for an accepted key with an active registration', () => {
    expect(
      computeGranolaConnectionState({
        status: GRANOLA_CONNECTION_STATUS_SCHEMA.parse(READY_STATUS),
        isConnecting: false,
        hasSetupFailed: false,
      }),
    ).toBe('CONNECTED');
  });

  it('shows connecting while the connection is being set up', () => {
    expect(
      computeGranolaConnectionState({
        status: GRANOLA_CONNECTION_STATUS_SCHEMA.parse({
          isConnected: false,
          isApiKeySet: false,
        }),
        isConnecting: true,
        hasSetupFailed: true,
      }),
    ).toBe('CONNECTING');
  });

  it.each([
    {
      overrides: { isConnected: false, isGranolaReachable: false },
      expected: 'UNREACHABLE',
    },
    { overrides: { isConnected: false }, expected: 'INVALID_KEY' },
    {
      overrides: { registration: { scopes: ['workspace'], isActive: false } },
      expected: 'PAUSED',
    },
    {
      overrides: { registration: undefined, needsRegistration: true },
      expected: 'SETUP_INCOMPLETE',
    },
    { overrides: { error: 'Granola failed' }, expected: 'SETUP_INCOMPLETE' },
  ])('tells $expected apart from the status', ({ overrides, expected }) => {
    expect(
      computeGranolaConnectionState({
        status: GRANOLA_CONNECTION_STATUS_SCHEMA.parse({
          ...READY_STATUS,
          ...overrides,
        }),
        isConnecting: false,
        hasSetupFailed: false,
      }),
    ).toBe(expected);
  });

  it('shows an incomplete setup when the setup request failed', () => {
    expect(
      computeGranolaConnectionState({
        status: GRANOLA_CONNECTION_STATUS_SCHEMA.parse(READY_STATUS),
        isConnecting: false,
        hasSetupFailed: true,
      }),
    ).toBe('SETUP_INCOMPLETE');
  });
});
