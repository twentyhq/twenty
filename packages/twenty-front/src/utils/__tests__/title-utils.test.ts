import { getPageTitleFromPath } from '../title-utils';

describe('title-utils', () => {
  it('should return the correct title for a given path', () => {
    expect(getPageTitleFromPath('/verify')).toBe('Verify');
    expect(getPageTitleFromPath('/welcome')).toBe(
      'Sign in or Create an account',
    );
    expect(getPageTitleFromPath('/invite/:workspaceInviteHash')).toBe('Invite');
    expect(getPageTitleFromPath('/create/workspace')).toBe('Create Workspace');
    expect(getPageTitleFromPath('/create/profile')).toBe('Create Profile');
    expect(getPageTitleFromPath('/tasks')).toBe('Tasks');
    expect(getPageTitleFromPath('/objects/opportunities')).toBe(
      'Opportunities',
    );
    expect(getPageTitleFromPath('/settings/profile')).toBe(
      'Profile - Settings',
    );
    expect(getPageTitleFromPath('/settings/profile/appearance')).toBe(
      'Appearance - Settings',
    );
    expect(getPageTitleFromPath('/settings/accounts')).toBe(
      'Accounts - Settings',
    );
    expect(getPageTitleFromPath('/settings/accounts/new')).toBe(
      'New Account - Settings',
    );
    expect(getPageTitleFromPath('/settings/accounts/calendars')).toBe(
      'Calendars - Settings',
    );
    expect(
      getPageTitleFromPath('/settings/accounts/calendars/:accountUuid'),
    ).toBe('Calendars Settings - Settings');
    expect(getPageTitleFromPath('/settings/accounts/emails')).toBe(
      'Emails - Settings',
    );
    expect(getPageTitleFromPath('/settings/accounts/emails/:accountUuid')).toBe(
      'Emails Settings - Settings',
    );
    expect(getPageTitleFromPath('/settings/workspace-members')).toBe(
      'Workspace Members - Settings',
    );
    expect(getPageTitleFromPath('/settings/workspace')).toBe(
      'Workspace - Settings',
    );
    expect(getPageTitleFromPath('/')).toBe('Twenty');
    expect(getPageTitleFromPath('/random')).toBe('Twenty');
  });
});
