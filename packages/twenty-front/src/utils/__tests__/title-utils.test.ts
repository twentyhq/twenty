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
    expect(getPageTitleFromPath('/settings/profile')).toBe('Profile');
    expect(getPageTitleFromPath('/settings/profile/appearance')).toBe(
      'Appearance',
    );
    expect(getPageTitleFromPath('/settings/workspace-members')).toBe(
      'Workspace Members',
    );
    expect(getPageTitleFromPath('/settings/workspace')).toBe('Workspace');
    expect(getPageTitleFromPath('/')).toBe('Twenty');
    expect(getPageTitleFromPath('/random')).toBe('Twenty');
  });
});
