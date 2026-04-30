import {
  type ApplicationAvatarColors,
  useApplicationAvatarColors,
} from '@/applications/hooks/useApplicationAvatarColors';
import { isTwentyStandardApplication } from '@/applications/utils/isTwentyStandardApplication';
import { isWorkspaceCustomApplication } from '@/applications/utils/isWorkspaceCustomApplication';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { buildApplicationLogoUrl } from '@/applications/utils/buildApplicationLogoUrl';
import CustomLogo from '~/pages/settings/applications/assets/custom-illustrations/custom-logo.webp';
import StandardLogo from '~/pages/settings/applications/assets/standard-illustrations/standard-logo.webp';

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

  const isStandard = isTwentyStandardApplication(application);

  const isCustom = isWorkspaceCustomApplication(application, currentWorkspace);

  const displayName = isStandard
    ? t`Standard`
    : isCustom
      ? t`Custom`
      : application.name;

  const logo = isStandard
    ? new URL(StandardLogo, window.location.href).toString()
    : isCustom
      ? new URL(CustomLogo, window.location.href).toString()
      : buildApplicationLogoUrl({
          applicationId: application.id,
          logo: application.logo,
          workspaceId: currentWorkspace?.id,
        });

  return {
    applicationChipData: {
      name: displayName,
      seed: application.name,
      colors,
      logo,
    },
  };
};
