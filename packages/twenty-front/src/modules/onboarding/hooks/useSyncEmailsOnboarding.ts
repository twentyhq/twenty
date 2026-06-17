import { useState } from 'react';

import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMutation } from '@apollo/client/react';
import { AppPath, type ConnectedAccountProvider } from 'twenty-shared/types';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated/graphql';
import { SkipSyncEmailOnboardingStepDocument } from '~/generated-metadata/graphql';

type UseSyncEmailsOnboardingParams = {
  defaultVisibility?: MessageChannelVisibility;
};

export const useSyncEmailsOnboarding = ({
  defaultVisibility = MessageChannelVisibility.SHARE_EVERYTHING,
}: UseSyncEmailsOnboardingParams = {}) => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const [visibility, setVisibility] =
    useState<MessageChannelVisibility>(defaultVisibility);
  const [lastAuthenticatedMethod] = useAtomState(lastAuthenticatedMethodState);
  const [skipSyncEmailOnboardingStatusMutation] = useMutation(
    SkipSyncEmailOnboardingStepDocument,
  );

  const syncWithProvider = async (provider: ConnectedAccountProvider) => {
    const calendarChannelVisibility =
      visibility === MessageChannelVisibility.SHARE_EVERYTHING
        ? CalendarChannelVisibility.SHARE_EVERYTHING
        : CalendarChannelVisibility.METADATA;

    await triggerApisOAuth(provider, {
      redirectLocation: AppPath.Index,
      messageVisibility: visibility,
      calendarVisibility: calendarChannelVisibility,
      skipMessageChannelConfiguration: true,
    });
  };

  const continueWithoutSync = async () => {
    await skipSyncEmailOnboardingStatusMutation();
    setNextOnboardingStatus();
  };

  const userAuthenticatedWithSSO =
    lastAuthenticatedMethod === AuthenticatedMethod.SSO;

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

  return {
    visibility,
    setVisibility,
    userAuthenticatedWithSSO,
    isGoogleProviderEnabled,
    isMicrosoftProviderEnabled,
    syncWithProvider,
    continueWithoutSync,
  };
};
