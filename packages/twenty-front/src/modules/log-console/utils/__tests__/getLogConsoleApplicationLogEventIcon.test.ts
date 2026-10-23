import { IconApps, IconBrandTypescript } from 'twenty-ui/icon';

import { getLogConsoleApplicationLogEventIcon } from '@/log-console/utils/getLogConsoleApplicationLogEventIcon';

describe('getLogConsoleApplicationLogEventIcon', () => {
  it('should show a function icon for logic function logs', () => {
    expect(getLogConsoleApplicationLogEventIcon('syncContacts')).toBe(
      IconBrandTypescript,
    );
  });

  it('should show the app icon for platform events without a function', () => {
    expect(getLogConsoleApplicationLogEventIcon('')).toBe(IconApps);
  });
});
