import { clientConfigApiStatusState } from '@/client-config/states/clientConfigApiStatusState';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { SyncEmailsAutoSkipEffect } from '@/onboarding/effect-components/SyncEmailsAutoSkipEffect';
import { useSkipSyncEmailOnboardingStep } from '@/onboarding/hooks/useSkipSyncEmailOnboardingStep';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCallback, useState } from 'react';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { ImportContacts } from '~/pages/onboarding/ImportContacts';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';

const IMPORT_CONTACTS_FREE_CREDITS = 0;

export const SyncEmailsV2 = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const skipSyncEmailOnboardingStep = useSkipSyncEmailOnboardingStep();
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

  const connectWithProvider = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: AppPath.Index,
      messageVisibility: MessageChannelVisibility.METADATA,
      calendarVisibility: CalendarChannelVisibility.METADATA,
      skipMessageChannelConfiguration: true,
    });

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
    <OnboardingV2Layout freeCredits={IMPORT_CONTACTS_FREE_CREDITS}>
      <ImportContacts
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
        onSkip={skipSyncEmailOnboardingStep}
      />
    </OnboardingV2Layout>
  );
};
