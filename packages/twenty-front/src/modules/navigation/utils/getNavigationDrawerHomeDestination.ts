import { isNonEmptyString } from '@sniptt/guards';

import { isAiModePath } from '~/utils/isAiModePath';
import { isSettingsPath } from '~/utils/isSettingsPath';

type GetNavigationDrawerHomeDestinationParams = {
  memorizedUrl: string | null | undefined;
  defaultHomePagePath: string;
};

// A memorized url can point into another mode when modes were chained (e.g. settings opened from chat), and
// going back there would leave the switcher on the mode the user just asked to leave.
export const getNavigationDrawerHomeDestination = ({
  memorizedUrl,
  defaultHomePagePath,
}: GetNavigationDrawerHomeDestinationParams) => {
  if (!isNonEmptyString(memorizedUrl)) {
    return defaultHomePagePath;
  }

  const [pathname] = memorizedUrl.split('?');

  return isSettingsPath(pathname) || isAiModePath(pathname)
    ? defaultHomePagePath
    : memorizedUrl;
};
