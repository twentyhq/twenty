import { getReturnToFromLocationState } from '@/settings/applications/utils/getReturnToFromLocationState';

describe('getReturnToFromLocationState', () => {
  it('returns an internal returnTo path', () => {
    expect(
      getReturnToFromLocationState({ returnTo: '/settings/accounts' }),
    ).toBe('/settings/accounts');
  });

  it('ignores a missing or non-object state', () => {
    expect(getReturnToFromLocationState(null)).toBeUndefined();
    expect(getReturnToFromLocationState('/settings')).toBeUndefined();
    expect(getReturnToFromLocationState({})).toBeUndefined();
  });

  it('ignores a returnTo that is not a safe internal path', () => {
    expect(
      getReturnToFromLocationState({ returnTo: 'https://evil.example' }),
    ).toBeUndefined();
    expect(
      getReturnToFromLocationState({ returnTo: '//evil.example' }),
    ).toBeUndefined();
    expect(getReturnToFromLocationState({ returnTo: 42 })).toBeUndefined();
  });
});
