import { canAddConnectionProviderConnection } from '@/settings/applications/utils/canAddConnectionProviderConnection';

describe('canAddConnectionProviderConnection', () => {
  it('allows another connection when the provider allows several', () => {
    expect(
      canAddConnectionProviderConnection({
        allowMultipleConnections: true,
        connectionCount: 2,
      }),
    ).toBe(true);
  });

  it('allows the first connection on a single-connection provider', () => {
    expect(
      canAddConnectionProviderConnection({
        allowMultipleConnections: false,
        connectionCount: 0,
      }),
    ).toBe(true);
  });

  it('refuses a second connection on a single-connection provider', () => {
    expect(
      canAddConnectionProviderConnection({
        allowMultipleConnections: false,
        connectionCount: 1,
      }),
    ).toBe(false);
  });
});
