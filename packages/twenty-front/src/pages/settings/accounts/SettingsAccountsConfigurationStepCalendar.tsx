import { Trans, useLingui } from '@lingui/react/macro';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

type SettingsAccountsConfigurationStepCalendarProps = {
  calendarChannel: CalendarChannel;
  messageChannel?: MessageChannel;
  isSubmitting: boolean;
  onAddAccount: () => void;
};

export const SettingsAccountsConfigurationStepCalendar = ({
  calendarChannel,
  messageChannel,
  isSubmitting,
  onAddAccount,
}: SettingsAccountsConfigurationStepCalendarProps) => {
  const { t } = useLingui();

  const stepNumber = isDefined(messageChannel) ? 2 : 1;
  const stepTitle = t`${stepNumber}. Calendar`;

  return (
    <SettingsPageLayout
      title={stepTitle}
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
          children: stepTitle,
        },
      ]}
      pageCommands={
        <PageCommandEffect
          engineComponentKey={EngineComponentKey.FINISH_ACCOUNT_SETUP}
          onRun={onAddAccount}
          isDisabled={isSubmitting}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
