import { getConnectedAppScopeLabels } from '@/settings/profile/connected-apps/utils/getConnectedAppScopeLabels';

describe('getConnectedAppScopeLabels', () => {
  it('describes each granted scope', () => {
    expect(getConnectedAppScopeLabels(['api', 'profile'])).toEqual([
      'Can read and write records',
      'Can see your profile',
    ]);
  });

  it('leaves out scopes it does not know', () => {
    expect(getConnectedAppScopeLabels(['api', 'offline_access'])).toEqual([
      'Can read and write records',
    ]);
  });

  it('describes nothing when no scope was recorded', () => {
    expect(getConnectedAppScopeLabels(null)).toEqual([]);
  });
});
