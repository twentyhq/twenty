import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { BUILT_IN_ACCOUNT_APPS } from '@/settings/app-preferences/constants/BuiltInAccountApps';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import {
  FeatureFlagKey,
  StartChannelSyncDocument,
} from '~/generated-metadata/graphql';
import { SettingsAccountsConfigurationSelectedMessageChannelEffect } from '~/pages/settings/accounts/SettingsAccountsConfigurationSelectedMessageChannelEffect';
import { SettingsAccountsConfigurationStepCalendar } from '~/pages/settings/accounts/SettingsAccountsConfigurationStepCalendar';
import { SettingsAccountsConfigurationStepEmail } from '~/pages/settings/accounts/SettingsAccountsConfigurationStepEmail';

enum SettingsAccountsConfigurationStep {
  Email = 'email',
  Calendar = 'calendar',
}

export const SettingsAccountsConfiguration = () => {
  const { t } = useLingui();
  const { connectedAccountId } = useParams<{
    connectedAccountId: string;
  }>();
  const navigate = useNavigate();
  const { enqueueToast } = useToast();
  const [startChannelSyncMutation, { loading: isSubmitting }] = useMutation(
    StartChannelSyncDocument,
  );
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { accounts } = useMyConnectedAccounts();

  const [currentStep, setCurrentStep] =
    useState<SettingsAccountsConfigurationStep>(
      SettingsAccountsConfigurationStep.Email,
    );

  const { data: metadataMessageChannelData } = useQuery<{
    myMessageChannels: MessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    variables: { connectedAccountId },
    skip: !connectedAccountId,
  });

  const { data: metadataCalendarChannelData } = useQuery<{
    myCalendarChannels: CalendarChannel[];
  }>(GET_MY_CALENDAR_CHANNELS, {
    variables: { connectedAccountId },
    skip: !connectedAccountId,
  });

  const messageChannels = metadataMessageChannelData?.myMessageChannels ?? [];

  const calendarChannels =
    metadataCalendarChannelData?.myCalendarChannels ?? [];

  const messageChannel = messageChannels[0];
  const calendarChannel = calendarChannels[0];

  const connectedAccount = accounts.find(
    (account) => account.id === connectedAccountId,
  );
  const builtInAccountApp = BUILT_IN_ACCOUNT_APPS.find(
    (app) => app.provider === connectedAccount?.provider,
  );
  const completionPath =
    isAppPreferencesEnabled && isDefined(builtInAccountApp)
      ? getSettingsPath(SettingsPath.BuiltInAccountApp, {
          builtInAccountAppId: builtInAccountApp.id,
        })
      : getSettingsPath(SettingsPath.Accounts);

  const handleNext = () => {
    setCurrentStep(SettingsAccountsConfigurationStep.Calendar);
  };

  const handleAddAccount = async () => {
    if (!connectedAccountId) return;

    await startChannelSyncMutation({
      variables: {
        connectedAccountId,
      },
      onCompleted: () => {
        enqueueToast({
          status: 'success',
          children: t`Account added successfully. Sync started.`,
        });
        navigate(completionPath);
      },
      onError: (error) => {
        enqueueToast(getToastOptionsFromError({ error }));
      },
    });
  };

  const showEmailStep =
    currentStep === SettingsAccountsConfigurationStep.Email &&
    isDefined(messageChannel);

  if (showEmailStep) {
    return (
      <>
        <SettingsAccountsConfigurationSelectedMessageChannelEffect
          messageChannel={messageChannel}
        />
        <SettingsAccountsConfigurationStepEmail
          messageChannel={messageChannel}
          hasNextStep={isDefined(calendarChannel)}
          isSubmitting={isSubmitting}
          onNext={handleNext}
          onAddAccount={handleAddAccount}
        />
      </>
    );
  }

  if (!isDefined(calendarChannel)) {
    return null;
  }

  return (
    <SettingsAccountsConfigurationStepCalendar
      calendarChannel={calendarChannel}
      messageChannel={messageChannel}
      isSubmitting={isSubmitting}
      onAddAccount={handleAddAccount}
    />
  );
};
