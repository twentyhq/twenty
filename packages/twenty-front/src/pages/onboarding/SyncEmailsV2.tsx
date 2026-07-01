import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { SyncEmailsAutoSkipEffect } from '@/onboarding/effect-components/SyncEmailsAutoSkipEffect';
import { useOnboardingFreeCreditsTotal } from '@/onboarding/hooks/useOnboardingFreeCreditsTotal';
import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { onboardingFreeCreditsState } from '@/onboarding/states/onboardingFreeCreditsState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useCallback, useState } from 'react';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { ImportContacts } from '~/pages/onboarding/ImportContacts';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';

export const SyncEmailsV2 = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();
  const setOnboardingFreeCredits = useSetAtomState(onboardingFreeCreditsState);
  const freeCreditsTotal = useOnboardingFreeCreditsTotal();
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);

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
    isGoogleMessagingEnabled || isGoogleCalendarEnabled;
  const isMicrosoftProviderEnabled =
    isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled;
  const hasProviderEnabled =
    isGoogleProviderEnabled || isMicrosoftProviderEnabled;
  const isClientConfigLoaded = useAtomStateValue(
    clientConfigApiStatusState,
  ).isLoadedOnce;
  const onboardingConfig = useAtomStateValue(onboardingConfigState);

  const connectWithProvider = async (provider: ConnectedAccountProvider) => {
    setOnboardingFreeCredits((current) => ({
      ...current,
      importContacts: onboardingConfig?.importContactsCreditsReward ?? 0,
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

  const handleSkip = () => {
    setOnboardingFreeCredits((current) => ({
      ...current,
      importContacts: 0,
    }));

    return skipSyncEmailOnboardingStep();
  };

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (!isClientConfigLoaded) {
    return null;
  }

  if (!hasProviderEnabled && !hasAutoSkipFailed) {
    return <SyncEmailsAutoSkipEffect onError={handleAutoSkipError} />;
  }

  return (
    <OnboardingV2Layout freeCredits={freeCreditsTotal}>
      <ImportContacts
        creditsReward={onboardingConfig?.importContactsCreditsReward}
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
    </OnboardingV2Layout>
  );
};
