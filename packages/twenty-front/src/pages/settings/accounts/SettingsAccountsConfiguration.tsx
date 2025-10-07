import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronRight, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { useStartChannelSyncMutation } from '~/generated-metadata/graphql';
import {
  SETTINGS_ACCOUNTS_CONFIGURATION_STEPS,
  SettingsAccountsConfigurationStep,
} from '~/pages/settings/accounts/SettingsAccountsConfigurationSteps';

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

  const currentStepIndex = SETTINGS_ACCOUNTS_CONFIGURATION_STEPS.findIndex(
    (step) => step.type === currentStep,
  );
  const currentStepConfig =
    SETTINGS_ACCOUNTS_CONFIGURATION_STEPS[currentStepIndex];
  const isLastStep =
    currentStepIndex === SETTINGS_ACCOUNTS_CONFIGURATION_STEPS.length - 1;

  const nextAvailableStep = SETTINGS_ACCOUNTS_CONFIGURATION_STEPS.slice(
    currentStepIndex + 1,
  ).find((step) => step.shouldRender({ messageChannel, calendarChannel }));

  const handleNext = () => {
    if (isDefined(nextAvailableStep)) {
      setCurrentStep(nextAvailableStep.type);
    } else {
      handleAddAccount();
    }
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

  const stepNumber = currentStepIndex + 1;
  const stepLabel = `${stepNumber}. ${t(currentStepConfig.label)}`;
  const CurrentStepComponent = currentStepConfig.Component;

  return (
    <SubMenuTopBarContainer
      title={stepLabel}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        {
          children: <Trans>Account</Trans>,
          href: getSettingsPath(SettingsPath.Accounts),
        },
        {
          children: stepLabel,
        },
      ]}
      actionButton={
        !isLastStep ? (
          <Button
            Icon={IconChevronRight}
            title={t`Next`}
            accent="blue"
            size="small"
            variant="secondary"
            onClick={handleNext}
            disabled={isSubmitting}
          />
        ) : (
          <Button
            Icon={IconPlus}
            title={t`Add account`}
            accent="blue"
            size="small"
            variant="primary"
            onClick={handleAddAccount}
            disabled={isSubmitting}
          />
        )
      }
    >
      <SettingsPageContainer>
        <CurrentStepComponent
          messageChannel={messageChannel}
          calendarChannel={calendarChannel}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
