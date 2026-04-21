import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import {
  useApplicationAvatarColors,
  type ApplicationAvatarColors,
} from '@/applications/hooks/useApplicationAvatarColors';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
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

  const isStandard =
    isDefined(application.universalIdentifier) &&
    application.universalIdentifier ===
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

  const isCustom =
    isDefined(currentWorkspace?.workspaceCustomApplication?.id) &&
    currentWorkspace.workspaceCustomApplication.id === application.id;

  const displayName = isCurrent
    ? t`This app`
    : isStandard
      ? t`Standard`
      : isCustom
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
