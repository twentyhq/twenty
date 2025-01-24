import { getPageTitleFromPath, SettingsPageTitles } from '../title-utils';

describe('title-utils', () => {
  it('should return the correct title for a given path', () => {
    expect(getPageTitleFromPath('/verify')).toBe('Verify');
    expect(getPageTitleFromPath('/welcome')).toBe(
      'Sign in or Create an account',
    );
    expect(getPageTitleFromPath('/invite/:workspaceInviteHash')).toBe('Invite');
    expect(getPageTitleFromPath('/create/workspace')).toBe('Create Workspace');
    expect(getPageTitleFromPath('/create/profile')).toBe('Create Profile');
    expect(getPageTitleFromPath('/settings/objects/opportunities')).toBe(
      SettingsPageTitles.Objects,
    );
    expect(getPageTitleFromPath('/settings/profile')).toBe(
      SettingsPageTitles.Profile,
    );
    expect(getPageTitleFromPath('/settings/experience')).toBe(
      SettingsPageTitles.Experience,
    );
    expect(getPageTitleFromPath('/settings/accounts')).toBe(
      SettingsPageTitles.Accounts,
    );
    expect(getPageTitleFromPath('/settings/accounts/new')).toBe(
      SettingsPageTitles.Accounts,
    );
    expect(getPageTitleFromPath('/settings/accounts/calendars')).toBe(
      SettingsPageTitles.Accounts,
    );
    expect(
      getPageTitleFromPath('/settings/accounts/calendars/:accountUuid'),
    ).toBe(SettingsPageTitles.Accounts);
    expect(getPageTitleFromPath('/settings/accounts/emails')).toBe(
      SettingsPageTitles.Accounts,
    );
    expect(getPageTitleFromPath('/settings/accounts/emails/:accountUuid')).toBe(
      SettingsPageTitles.Accounts,
    );
    expect(getPageTitleFromPath('/settings/workspace-members')).toBe(
      SettingsPageTitles.Members,
    );
    expect(getPageTitleFromPath('/settings/workspace')).toBe(
      SettingsPageTitles.General,
    );
    expect(getPageTitleFromPath('/')).toBe('Twenty');
    expect(getPageTitleFromPath('/random')).toBe('Twenty');
  });
});
