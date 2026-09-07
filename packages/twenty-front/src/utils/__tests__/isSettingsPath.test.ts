import { isSettingsPath } from '~/utils/isSettingsPath';

describe('isSettingsPath', () => {
  it.each(['/settings', '/settings/profile', '/settings/objects/companies'])(
    'matches %p',
    (pathname) => {
      expect(isSettingsPath(pathname)).toBe(true);
    },
  );

  it.each([
    '/objects/companies',
    '/objects/settings',
    '/settingsomething',
    // A custom object named "settings" gives a record path with the segment in it
    '/object/settings/20202020-0687-4c41-b707-ed1bfca972a7',
  ])('does not match %p', (pathname) => {
    expect(isSettingsPath(pathname)).toBe(false);
  });
});
