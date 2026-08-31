import { useApplicationFromStore } from '@/applications/hooks/useApplicationFromStore';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useCallback, useEffect, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ApplicationState } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type FollowedInstall = {
  applicationId: string;
  // A row that was already there reads INSTALLED until the job moves it, so on
  // those installs only a state change proves the job this started has finished.
  requiresStateChange: boolean;
};

export const useFollowApplicationInstall = ({
  applicationName,
}: {
  applicationName: string;
}) => {
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [followedInstall, setFollowedInstall] =
    useState<FollowedInstall | null>(null);
  const [hasSeenApplicationRow, setHasSeenApplicationRow] = useState(false);

  const { application, isApplicationsStoreReady } = useApplicationFromStore({
    applicationId: followedInstall?.applicationId,
  });

  // The install runs in a background job, so the row the mutation named is what
  // says how it ended: settling on INSTALLED opens the application, and
  // disappearing means the install was rolled back.
  useEffect(() => {
    if (!isDefined(followedInstall)) {
      return;
    }

    if (isDefined(application)) {
      if (application.state !== ApplicationState.INSTALLED) {
        setHasSeenApplicationRow(true);

        return;
      }

      if (followedInstall.requiresStateChange && !hasSeenApplicationRow) {
        return;
      }

      setHasSeenApplicationRow(false);
      setFollowedInstall(null);

      navigateSettings(SettingsPath.ApplicationDetail, {
        applicationId: followedInstall.applicationId,
      });

      return;
    }

    // Absence only means a rollback once the row has been seen: it reaches the
    // store on the created event, a moment after the mutation returns.
    if (isApplicationsStoreReady && hasSeenApplicationRow) {
      setHasSeenApplicationRow(false);
      setFollowedInstall(null);

      enqueueErrorSnackBar({
        message: t`Failed to install ${applicationName}.`,
      });
    }
  }, [
    application,
    applicationName,
    enqueueErrorSnackBar,
    followedInstall,
    hasSeenApplicationRow,
    isApplicationsStoreReady,
    navigateSettings,
  ]);

  const followInstall = useCallback((followedInstall: FollowedInstall) => {
    setHasSeenApplicationRow(false);
    setFollowedInstall(followedInstall);
  }, []);

  return {
    followInstall,
    followedInstallApplicationId: followedInstall?.applicationId ?? null,
  };
};
