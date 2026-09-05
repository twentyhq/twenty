import { isNonEmptyString } from '@sniptt/guards';

import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

type GetNavigationDrawerHomeDestinationParams = {
  memorizedUrl: string | null | undefined;
  defaultHomePagePath: string;
};

// Each mode memorizes where it was opened from, so a memorized url can point at
// another mode when the user chained them (settings opened from the chat, or
// the reverse). Going back there would leave the switcher on the mode the user
// just asked to leave.
export const getNavigationDrawerHomeDestination = ({
  memorizedUrl,
  defaultHomePagePath,
}: GetNavigationDrawerHomeDestinationParams) => {
  if (!isNonEmptyString(memorizedUrl)) {
    return defaultHomePagePath;
  }

  const [pathname] = memorizedUrl.split('?');

  return isSettingsPath(pathname) ||
    isAiChatPath(pathname) ||
    isInboxPath(pathname)
    ? defaultHomePagePath
    : memorizedUrl;
};
