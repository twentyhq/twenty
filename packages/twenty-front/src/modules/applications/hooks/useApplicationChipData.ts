import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from '@/applications/constants/TwentyStandardApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';
import { isDefined } from 'twenty-shared/utils';

type UseApplicationChipDataArgs = {
  applicationId: string;
};

type ApplicationChipColors = {
  color: string;
  backgroundColor: string;
  borderColor: string;
};

type ApplicationChipData = {
  name: string;
  seed: string;
  colors?: ApplicationChipColors;
};

type UseApplicationChipDataReturnType = {
  applicationChipData: ApplicationChipData;
};

export const useApplicationChipData = ({
  applicationId,
}: UseApplicationChipDataArgs): UseApplicationChipDataReturnType => {
  const { theme } = useContext(ThemeContext);
  const currentApplicationId = useContext(CurrentApplicationContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const application = currentWorkspace?.installedApplications.find(
    (installedApplication) => installedApplication.id === applicationId,
  );

  const isCurrent =
    isDefined(currentApplicationId) && currentApplicationId === applicationId;

  const isStandard =
    application?.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
    application?.name === 'Standard';
  const isCustom =
    (isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
      currentWorkspace.workspaceCustomApplication.id === applicationId) ||
    application?.name === 'Custom';

  const colors: ApplicationChipColors | undefined = isStandard
    ? {
        backgroundColor: theme.color.blue5,
        borderColor: theme.color.blue6,
        color: theme.color.blue12,
      }
    : isCustom
      ? {
          backgroundColor: theme.color.orange5,
          borderColor: theme.color.orange6,
          color: theme.color.orange12,
        }
      : undefined;

  return {
    applicationChipData: {
      name: isCurrent ? t`This app` : (application?.name ?? ''),
      seed:
        application?.universalIdentifier ?? application?.name ?? applicationId,
      colors,
    },
  };
};
