import { Trans, useLingui } from '@lingui/react/macro';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { useResolveAccountsSettingsPath } from '@/settings/app-preferences/hooks/useResolveAccountsSettingsPath';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconDeviceFloppy } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
  const isAppPreferencesEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_APP_PREFERENCES_ENABLED,
  );
  const { resolveAccountsSettingsPath } = useResolveAccountsSettingsPath();

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
          children: isAppPreferencesEnabled ? (
            <Trans>Apps preferences</Trans>
          ) : (
            <Trans>Account</Trans>
          ),
          href: getSettingsPath(
            resolveAccountsSettingsPath(SettingsPath.Accounts),
          ),
        },
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
