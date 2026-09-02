import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { type ClaimedApplication } from '@/applications/types/claimedApplication.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationState } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useFollowApplicationInstallation = () => {
  const [claimedApplication, setClaimedApplication] =
    useState<ClaimedApplication | null>(null);
  const [hasSeenTransitionalState, setHasSeenTransitionalState] =
    useState(false);

  const applications = useAtomStateValue(applicationsSelector);
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const followApplicationInstallation = (application: ClaimedApplication) => {
    setHasSeenTransitionalState(false);
    setClaimedApplication(application);
  };

  useEffect(() => {
    if (!isDefined(claimedApplication)) {
      return;
    }

    const application = applications.find(
      ({ id }) => id === claimedApplication.id,
    );

    if (!isDefined(application)) {
      if (!hasSeenTransitionalState) {
        return;
      }

      setClaimedApplication(null);
      enqueueErrorSnackBar({
        message: t`Failed to install the application.`,
      });

      return;
    }

    if (application.state !== ApplicationState.INSTALLED) {
      setHasSeenTransitionalState(true);

      return;
    }

    const hasSettled =
      hasSeenTransitionalState ||
      application.version !== claimedApplication.version;

    if (!hasSettled) {
      return;
    }

    setClaimedApplication(null);
    enqueueSuccessSnackBar({
      message: t`Application installed successfully.`,
    });
    navigateSettings(SettingsPath.ApplicationDetail, {
      applicationId: application.id,
    });
  }, [
    applications,
    claimedApplication,
    hasSeenTransitionalState,
    enqueueErrorSnackBar,
    enqueueSuccessSnackBar,
    navigateSettings,
  ]);

  return { followApplicationInstallation };
};
