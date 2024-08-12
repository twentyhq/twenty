import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';

describe('getSettingsPagePath', () => {
  test('should compute page path', () => {
    expect(getSettingsPagePath(SettingsPath.ServerlessFunctions)).toEqual(
      '/settings/functions',
    );
  });
  test('should compute page path with id', () => {
    expect(
      getSettingsPagePath(SettingsPath.ServerlessFunctions, { id: 'id' }),
    ).toEqual('/settings/functions/id');
  });
});
