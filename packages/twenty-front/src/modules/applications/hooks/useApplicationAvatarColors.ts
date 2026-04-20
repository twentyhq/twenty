import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext } from 'react';
import {
  TWENTY_STANDARD_APPLICATION_NAME,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
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

export const useApplicationAvatarColors = (
  application: UseApplicationAvatarColorsArgs | null | undefined,
): ApplicationAvatarColors | undefined => {
  const { theme } = useContext(ThemeContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  if (!isDefined(application) || !isDefined(application.id)) {
    return undefined;
  }

  const isStandard =
    application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    application.name === TWENTY_STANDARD_APPLICATION_NAME;

  const isCustom =
    isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
    currentWorkspace.workspaceCustomApplication.id === application.id;

  if (isStandard) {
    return {
      backgroundColor: theme.color.blue5,
      borderColor: theme.color.blue6,
      color: theme.color.blue12,
    };
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
