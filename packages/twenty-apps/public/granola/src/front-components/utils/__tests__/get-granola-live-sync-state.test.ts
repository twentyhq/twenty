import { describe, expect, it } from 'vitest';

import { getGranolaLiveSyncState } from 'src/front-components/utils/get-granola-live-sync-state.util';

describe('getGranolaLiveSyncState', () => {
  it('is unregistered without a registration', () => {
    expect(getGranolaLiveSyncState({})).toBe('unregistered');
  });

  it('is active for an enabled endpoint', () => {
    expect(
      getGranolaLiveSyncState({
        registration: { scopes: ['workspace'], isActive: true },
      }),
    ).toBe('active');
  });

  it('is paused for a disabled endpoint', () => {
    expect(
      getGranolaLiveSyncState({
        registration: { scopes: ['personal', 'public'], isActive: false },
      }),
    ).toBe('paused');
  });
});
