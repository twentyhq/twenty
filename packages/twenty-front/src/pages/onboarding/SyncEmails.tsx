import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { SyncEmailsAutoSkipEffect } from '@/onboarding/effect-components/SyncEmailsAutoSkipEffect';
import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback, useState } from 'react';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { ImportContacts } from '~/pages/onboarding/ImportContacts';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';

export const SyncEmails = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);
  const currentUserWorkspace = useAtomStateValue(currentUserWorkspaceState);
  const hasConnectedAccountsPermission = useHasPermissionFlag(
    PermissionFlagType.CONNECTED_ACCOUNTS,
  );

  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );
  const isGoogleCalendarEnabled = useAtomStateValue(
    isGoogleCalendarEnabledState,
  );
  const isMicrosoftCalendarEnabled = useAtomStateValue(
    isMicrosoftCalendarEnabledState,
  );

  const isGoogleProviderEnabled =
    hasConnectedAccountsPermission &&
    (isGoogleMessagingEnabled || isGoogleCalendarEnabled);
  const isMicrosoftProviderEnabled =
    hasConnectedAccountsPermission &&
    (isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled);
  const hasProviderEnabled =
    isGoogleProviderEnabled || isMicrosoftProviderEnabled;
  const isClientConfigLoaded = useAtomStateValue(
    clientConfigApiStatusState,
  ).isLoadedOnce;
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const isFirstWorkspaceUser = currentWorkspace?.workspaceMembersCount === 1;
  const creditsReward = isFirstWorkspaceUser
    ? onboardingConfig?.importContactsCreditsReward
    : undefined;

  const connectWithProvider = async (provider: ConnectedAccountProvider) => {
    setOnboardingFreeCredits((current) => ({
      ...current,
      importContacts: creditsReward ?? 0,
    }));

    try {
      await triggerApisOAuth(provider, {
        redirectLocation: AppPath.Index,
        messageVisibility: MessageChannelVisibility.METADATA,
        calendarVisibility: CalendarChannelVisibility.METADATA,
        skipMessageChannelConfiguration: true,
      });
    } catch (error) {
      setOnboardingFreeCredits((current) => ({
        ...current,
        importContacts: 0,
      }));

      throw error;
    }
  };

  const handleSkip = async () => {
    await skipSyncEmailOnboardingStep({ isAutoSkipped: false });

    setOnboardingFreeCredits((current) => ({
      ...current,
      importContacts: 0,
    }));
  };

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (!isClientConfigLoaded || !isDefined(currentUserWorkspace)) {
    return null;
  }

  if (!hasProviderEnabled && !hasAutoSkipFailed) {
    return <SyncEmailsAutoSkipEffect onError={handleAutoSkipError} />;
  }

  return (
    <ImportContacts
      creditsReward={creditsReward}
      onContinueWithGoogle={
        isGoogleProviderEnabled
          ? () => connectWithProvider(ConnectedAccountProvider.GOOGLE)
          : undefined
      }
      onContinueWithMicrosoft={
        isMicrosoftProviderEnabled
          ? () => connectWithProvider(ConnectedAccountProvider.MICROSOFT)
          : undefined
      }
      onSkip={handleSkip}
    />
  );
};
