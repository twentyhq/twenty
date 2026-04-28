import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import {
  useApplicationAvatarColors,
  type ApplicationAvatarColors,
} from '@/applications/hooks/useApplicationAvatarColors';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseApplicationChipDataArgs = {
  applicationId: string;
};

type ApplicationChipData = {
  name: string;
  seed: string;
  colors?: ApplicationAvatarColors;
};

type UseApplicationChipDataReturnType = {
  applicationChipData: ApplicationChipData;
};

export const useApplicationChipData = ({
  applicationId,
}: UseApplicationChipDataArgs): UseApplicationChipDataReturnType => {
  const currentApplicationId = useContext(CurrentApplicationContext);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const application = currentWorkspace?.installedApplications.find(
    (installedApplication) => installedApplication.id === applicationId,
  );

  const colors = useApplicationAvatarColors(application);

  if (!isDefined(application)) {
    return {
      applicationChipData: {
        name: '',
        seed: applicationId,
      },
    };
  }

  const isCurrent =
    isDefined(currentApplicationId) && currentApplicationId === applicationId;

  const displayName = isCurrent
    ? t`This app`
    : isTwentyStandardApplication(application)
      ? t`Standard`
      : isWorkspaceCustomApplication(application, currentWorkspace)
        ? t`Custom`
        : application.name;

  return {
    applicationChipData: {
      name: displayName,
      seed: application.universalIdentifier ?? application.name,
      colors,
    },
  };
};
