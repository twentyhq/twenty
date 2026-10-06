import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadedState';
import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { OnboardingSkipDialog } from '@/onboarding/components/OnboardingSkipDialog';
import { OnboardingSkipDialogAvatars } from '@/onboarding/components/OnboardingSkipDialogAvatars';
import { ONBOARDING_NETWORK_PREVIEW_PEOPLE } from '@/onboarding/constants/OnboardingNetworkPreviewPeople';
import { ONBOARDING_SKIP_DIALOG_IDS } from '@/onboarding/constants/OnboardingSkipDialogIds';
import { SyncEmailsAutoSkipEffect } from '@/onboarding/effect-components/SyncEmailsAutoSkipEffect';
import { useOnboardingStepEnterHotkey } from '@/onboarding/hooks/useOnboardingStepEnterHotkey';
import { useSetOnboardingStepFreeCredits } from '@/onboarding/hooks/useSetOnboardingStepFreeCredits';
import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { onboardingCreditsProgressSelector } from '@/onboarding/states/selectors/onboardingCreditsProgressSelector';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PageFocusId } from '@/ui/utilities/focus/types/PageFocusId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { ImportContacts } from '~/pages/onboarding/ImportContacts';

export const SyncEmails = () => {
  const { t } = useLingui();
  const { openDialog } = useDialog();
  const importContactsCreditsReward = useAtomStateValue(
    onboardingCreditsProgressSelector,
  ).rewardCreditsByStep.importContacts;
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();
  const setOnboardingStepFreeCredits = useSetOnboardingStepFreeCredits();
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);
  const isCurrentUserLoaded = useAtomStateValue(isCurrentUserLoadedState);
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

  const connectWithProvider = async (provider: ConnectedAccountProvider) => {
    setOnboardingStepFreeCredits('importContacts', importContactsCreditsReward);

    try {
      await triggerApisOAuth(provider, {
        redirectLocation: AppPath.Index,
        messageVisibility: MessageChannelVisibility.METADATA,
        calendarVisibility: CalendarChannelVisibility.METADATA,
        skipMessageChannelConfiguration: true,
      });
    } catch (error) {
      setOnboardingStepFreeCredits('importContacts', 0);

      throw error;
    }
  };

  const providerActions = [
    {
      isEnabled: isMicrosoftProviderEnabled,
      label: t`Continue with Microsoft`,
      Icon: IconMicrosoft,
      creditsReward: importContactsCreditsReward,
      onClick: () => connectWithProvider(ConnectedAccountProvider.MICROSOFT),
    },
    {
      isEnabled: isGoogleProviderEnabled,
      label: t`Continue with Google`,
      Icon: IconGoogle,
      creditsReward: importContactsCreditsReward,
      onClick: () => connectWithProvider(ConnectedAccountProvider.GOOGLE),
    },
  ].filter((providerAction) => providerAction.isEnabled);

  const handleSkipConfirm = async () => {
    await skipSyncEmailOnboardingStep({ isAutoSkipped: false });

    setOnboardingStepFreeCredits('importContacts', 0);
  };

  const handleSkip = () => {
    if (!hasProviderEnabled) {
      void handleSkipConfirm();

      return;
    }

    openDialog(ONBOARDING_SKIP_DIALOG_IDS.syncEmails);
  };

  useOnboardingStepEnterHotkey({
    focusId: PageFocusId.SyncEmail,
    onEnter: handleSkip,
  });

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (!isClientConfigLoaded || !isCurrentUserLoaded) {
    return null;
  }

  if (!hasProviderEnabled && !hasAutoSkipFailed) {
    return <SyncEmailsAutoSkipEffect onError={handleAutoSkipError} />;
  }

  return (
    <>
      <ImportContacts providerActions={providerActions} onSkip={handleSkip} />
      <OnboardingSkipDialog
        dialogId={ONBOARDING_SKIP_DIALOG_IDS.syncEmails}
        visual={
          <OnboardingSkipDialogAvatars
            avatars={ONBOARDING_NETWORK_PREVIEW_PEOPLE.map((person) => ({
              id: person.id,
              name: '',
              src: person.avatarUrl,
              shape: 'circle',
            }))}
          />
        }
        title={t`Start with your whole network`}
        description={t`Twenty adds the people you email and meet, and keeps them up to date without manual data entry.`}
        actions={providerActions}
        onSkip={() => void handleSkipConfirm()}
      />
    </>
  );
};
