import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useMutation, useQuery } from '@apollo/client/react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { StartChannelSyncDocument } from '~/generated-metadata/graphql';
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
  const { enqueueErrorToast } = useErrorToast();
  const [startChannelSyncMutation, { loading: isSubmitting }] = useMutation(
    StartChannelSyncDocument,
  );

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
          variant: 'success',
          children: t`Account added successfully. Sync started.`,
        });
        navigate(getSettingsPath(SettingsPath.Accounts));
      },
      onError: (error) => {
        enqueueErrorToast(error);
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
