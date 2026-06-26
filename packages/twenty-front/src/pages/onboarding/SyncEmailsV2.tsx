import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { OnboardingV2Layout } from '@/onboarding/components/OnboardingV2Layout';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { ImportContacts } from '~/pages/onboarding/ImportContacts';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';
import { SkipSyncEmailOnboardingStepDocument } from '~/generated-metadata/graphql';

const IMPORT_CONTACTS_FREE_CREDITS = 0;

export const SyncEmailsV2 = () => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [skipSyncEmailOnboardingStepMutation] = useMutation(
    SkipSyncEmailOnboardingStepDocument,
  );
  const [lastAuthenticatedMethod] = useAtomState(lastAuthenticatedMethodState);

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

  const userAuthenticatedWithSSO =
    lastAuthenticatedMethod === AuthenticatedMethod.SSO;
  const isGoogleProviderEnabled =
    isGoogleMessagingEnabled || isGoogleCalendarEnabled;
  const isMicrosoftProviderEnabled =
    isMicrosoftMessagingEnabled || isMicrosoftCalendarEnabled;

  const connectWithProvider = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: AppPath.Index,
      messageVisibility: MessageChannelVisibility.METADATA,
      calendarVisibility: CalendarChannelVisibility.METADATA,
      skipMessageChannelConfiguration: true,
    });

  const handleSkip = async () => {
    await skipSyncEmailOnboardingStepMutation();
    setNextOnboardingStatus();
  };

  const showGoogle = !userAuthenticatedWithSSO && isGoogleProviderEnabled;
  const showMicrosoft = !userAuthenticatedWithSSO && isMicrosoftProviderEnabled;

  return (
    <OnboardingV2Layout freeCredits={IMPORT_CONTACTS_FREE_CREDITS}>
      <ImportContacts
        onContinueWithGoogle={
          showGoogle
            ? () => connectWithProvider(ConnectedAccountProvider.GOOGLE)
            : undefined
        }
        onContinueWithMicrosoft={
          showMicrosoft
            ? () => connectWithProvider(ConnectedAccountProvider.MICROSOFT)
            : undefined
        }
        onSkip={handleSkip}
      />
    </OnboardingV2Layout>
  );
};
