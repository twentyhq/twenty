import { getConnectedAppScopeLabels } from '@/settings/profile/connected-apps/utils/getConnectedAppScopeLabels';

describe('getConnectedAppScopeLabels', () => {
  it('describes each granted scope', () => {
    expect(getConnectedAppScopeLabels(['api', 'profile'])).toEqual([
      'Access your workspace data',
      'Read your profile',
    ]);
  });

  it('leaves out scopes it does not know', () => {
    expect(getConnectedAppScopeLabels(['api', 'offline_access'])).toEqual([
      'Access your workspace data',
    ]);
  });

  it('describes nothing when no scope was recorded', () => {
    expect(getConnectedAppScopeLabels(null)).toEqual([]);
  });
});
