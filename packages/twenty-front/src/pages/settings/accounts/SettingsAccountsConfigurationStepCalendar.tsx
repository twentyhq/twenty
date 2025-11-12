import { Trans, useLingui } from '@lingui/react/macro';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

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
    <SubMenuTopBarContainer
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
      actionButton={
        <Button
          Icon={IconPlus}
          title={t`Add account`}
          accent="blue"
          size="small"
          variant="primary"
          onClick={onAddAccount}
          disabled={isSubmitting}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
