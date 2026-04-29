import { CurrentApplicationContext } from '@/applications/contexts/CurrentApplicationContext';
import {
  type ApplicationAvatarColors,
  useApplicationAvatarColors,
} from '@/applications/hooks/useApplicationAvatarColors';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { buildApplicationLogoUrl } from '@/applications/utils/buildApplicationLogoUrl';

type UseApplicationChipDataArgs = {
  applicationId?: string | null;
  fallbackApplicationData?: {
    logo?: string | null;
    name?: string | null;
  };
};

type ApplicationChipData = {
  name: string;
  seed: string;
  colors?: ApplicationAvatarColors;
  logo?: string;
};

type UseApplicationChipDataReturnType = {
  applicationChipData: ApplicationChipData;
};

export const useApplicationChipData = ({
  applicationId,
  fallbackApplicationData,
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
        name: fallbackApplicationData?.name ?? '',
        logo: fallbackApplicationData?.logo ?? '',
        seed: fallbackApplicationData?.name ?? '',
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
      logo: buildApplicationLogoUrl({
        applicationId: application.id,
        logo: application.logo,
        workspaceId: currentWorkspace?.id,
      }),
    },
  };
};
