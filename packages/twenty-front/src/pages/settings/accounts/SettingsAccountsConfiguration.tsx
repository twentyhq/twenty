import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { useStartChannelSyncMutation } from '~/generated-metadata/graphql';
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
  const [startChannelSyncMutation, { loading: isSubmitting }] =
    useStartChannelSyncMutation();

  const [currentStep, setCurrentStep] =
    useState<SettingsAccountsConfigurationStep>(
      SettingsAccountsConfigurationStep.Email,
    );

  const { records: messageChannels } = useFindManyRecords<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
    filter: {
      connectedAccountId: {
        eq: connectedAccountId,
      },
    },
    skip: !connectedAccountId,
  });

  const { records: calendarChannels } = useFindManyRecords<CalendarChannel>({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
    filter: {
      connectedAccountId: {
        eq: connectedAccountId,
      },
    },
    skip: !connectedAccountId,
  });

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

  switch (currentStep) {
    case SettingsAccountsConfigurationStep.Email:
      if (!isDefined(messageChannel)) {
        return null;
      }
      return (
        <SettingsAccountsConfigurationStepEmail
          messageChannel={messageChannel}
          hasNextStep={isDefined(calendarChannel)}
          isSubmitting={isSubmitting}
          onNext={handleNext}
          onAddAccount={handleAddAccount}
        />
      );
    case SettingsAccountsConfigurationStep.Calendar:
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
  }
};
