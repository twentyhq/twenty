import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import {
  CoreObjectNameSingular,
  FeatureFlagKey,
  SettingsPath,
} from 'twenty-shared/types';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { GET_MY_CALENDAR_CHANNELS } from '@/settings/accounts/graphql/queries/getMyCalendarChannels';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { settingsAccountsSelectedMessageChannelState } from '@/settings/accounts/states/settingsAccountsSelectedMessageChannelState';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { useMutation, useQuery } from '@apollo/client/react';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
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
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [startChannelSyncMutation, { loading: isSubmitting }] = useMutation(
    StartChannelSyncDocument,
  );
  const setSettingsAccountsSelectedMessageChannel = useSetAtomState(
    settingsAccountsSelectedMessageChannelState,
  );

  const [currentStep, setCurrentStep] =
    useState<SettingsAccountsConfigurationStep>(
      SettingsAccountsConfigurationStep.Email,
    );

  const featureFlagsMap = useFeatureFlagsMap();
  const isMigrated =
    featureFlagsMap[FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED] ?? false;

  const { recordGqlFields } = useGenerateDepthRecordGqlFieldsFromObject({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    depth: 1,
    shouldOnlyLoadRelationIdentifiers: false,
  });

  const { records: workspaceMessageChannels } =
    useFindManyRecords<MessageChannel>({
      objectNameSingular: CoreObjectNameSingular.MessageChannel,
      filter: {
        connectedAccountId: {
          eq: connectedAccountId,
        },
      },
      recordGqlFields,
      onCompleted: (data) => {
        if (isDefined(data[0])) {
          setSettingsAccountsSelectedMessageChannel(data[0]);
        }
      },
      skip: !connectedAccountId || isMigrated,
    });

  const { records: workspaceCalendarChannels } =
    useFindManyRecords<CalendarChannel>({
      objectNameSingular: CoreObjectNameSingular.CalendarChannel,
      filter: {
        connectedAccountId: {
          eq: connectedAccountId,
        },
      },
      skip: !connectedAccountId || isMigrated,
    });

  const { data: metadataMessageChannelData } = useQuery<{
    myMessageChannels: MessageChannel[];
  }>(GET_MY_MESSAGE_CHANNELS, {
    variables: { connectedAccountId },
    skip: !isMigrated || !connectedAccountId,
  });

  const { data: metadataCalendarChannelData } = useQuery<{
    myCalendarChannels: CalendarChannel[];
  }>(GET_MY_CALENDAR_CHANNELS, {
    variables: { connectedAccountId },
    skip: !isMigrated || !connectedAccountId,
  });

  const messageChannels = isMigrated
    ? (metadataMessageChannelData?.myMessageChannels ?? [])
    : workspaceMessageChannels;

  const calendarChannels = isMigrated
    ? (metadataCalendarChannelData?.myCalendarChannels ?? [])
    : workspaceCalendarChannels;

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
        enqueueSuccessSnackBar({
          message: t`Account added successfully. Sync started.`,
        });
        navigate(getSettingsPath(SettingsPath.Accounts));
      },
      onError: (error) => {
        enqueueErrorSnackBar({
          apolloError: error,
        });
      },
    });
  };

  const showEmailStep =
    currentStep === SettingsAccountsConfigurationStep.Email &&
    isDefined(messageChannel);

  if (showEmailStep) {
    return (
      <>
        {isMigrated && (
          <SettingsAccountsConfigurationSelectedMessageChannelEffect
            messageChannel={messageChannel as unknown as MessageChannel}
          />
        )}
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
