import { Trans, useLingui } from '@lingui/react/macro';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

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
  const accountsBreadcrumbLink = useAccountsSettingsBreadcrumbLink(
    <Trans>Account</Trans>,
  );

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
        accountsBreadcrumbLink,
        {
          children: stepTitle,
        },
      ]}
      actionButton={
        <Button
          startIcon={<IconDeviceFloppy />}
          size="sm"
          onClick={onAddAccount}
          disabled={isSubmitting}
          variant="solid"
          color="accent"
        >{t`Finish Setup`}</Button>
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
