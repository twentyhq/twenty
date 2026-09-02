import { applicationsSelector } from '@/applications/states/applicationsSelector';
import { type RequestedApplication } from '@/applications/types/requestedApplication.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationState } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useFollowApplicationInstallation = () => {
  const [requestedApplication, setRequestedApplication] =
    useState<RequestedApplication | null>(null);
  const [hasSeenTransitionalState, setHasSeenTransitionalState] =
    useState(false);

  const applications = useAtomStateValue(applicationsSelector);
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const followApplicationInstallation = (application: RequestedApplication) => {
    setHasSeenTransitionalState(false);
    setRequestedApplication(application);
  };

  useEffect(() => {
    if (!isDefined(requestedApplication)) {
      return;
    }

    const application = applications.find(
      ({ id }) => id === requestedApplication.id,
    );

    if (!isDefined(application)) {
      if (!hasSeenTransitionalState) {
        return;
      }

      setRequestedApplication(null);
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
      application.version !== requestedApplication.version;

    if (!hasSettled) {
      return;
    }

    setRequestedApplication(null);
    enqueueSuccessSnackBar({
      message: t`Application installed successfully.`,
    });
    navigateSettings(SettingsPath.ApplicationDetail, {
      applicationId: application.id,
    });
  }, [
    applications,
    requestedApplication,
    hasSeenTransitionalState,
    enqueueErrorSnackBar,
    enqueueSuccessSnackBar,
    navigateSettings,
  ]);

  return { followApplicationInstallation };
};
