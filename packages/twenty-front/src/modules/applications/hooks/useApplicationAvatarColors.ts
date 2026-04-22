import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { ThemeContext } from 'twenty-ui/theme-constants';

export type ApplicationAvatarColors = {
  color: string;
  backgroundColor: string;
  borderColor: string;
};

type UseApplicationAvatarColorsArgs = {
  id?: string | null;
  name?: string | null;
  universalIdentifier?: string | null;
};

const STANDARD_APPLICATION_AVATAR_COLORS: ApplicationAvatarColors = {
  // The standard application avatar follows the Figma `Colors/Blue` palette,
  // which is Radix's pure blue and not Twenty's `theme.color.blue*` tokens
  // (those map to the indigo palette).
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  backgroundColor: '#CEE7FE',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  borderColor: '#B7D9F8',
  // oxlint-disable-next-line twenty/no-hardcoded-colors
  color: '#113264',
};

export const useApplicationAvatarColors = (
  application: UseApplicationAvatarColorsArgs | null | undefined,
): ApplicationAvatarColors | undefined => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (!isDefined(application) || !isDefined(application.id)) {
    return undefined;
  }

  const isStandard =
    isDefined(application.universalIdentifier) &&
    application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

  const isCustom =
    isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
    currentWorkspace.workspaceCustomApplication.id === application.id;

  if (isStandard) {
    return STANDARD_APPLICATION_AVATAR_COLORS;
  }

  if (isCustom) {
    return {
      backgroundColor: theme.color.orange5,
      borderColor: theme.color.orange6,
      color: theme.color.orange12,
    };
  }

  return undefined;
};
