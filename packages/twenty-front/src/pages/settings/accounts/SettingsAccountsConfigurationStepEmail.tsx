import { Trans, useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

type SettingsAccountsConfigurationStepEmailProps = {
  messageChannel: MessageChannel;
  hasNextStep: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onAddAccount: () => void;
};

export const SettingsAccountsConfigurationStepEmail = ({
  messageChannel,
  hasNextStep,
  isSubmitting,
  onNext,
  onAddAccount,
}: SettingsAccountsConfigurationStepEmailProps) => {
  const { t } = useLingui();

  return (
    <SettingsPageLayout
      title={t`1. Email`}
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
          children: t`1. Email`,
        },
      ]}
      actionButton={
        hasNextStep ? (
          <Button
            startIcon={<IconChevronRight />}
            size="sm"
            onClick={onNext}
            disabled={isSubmitting}
            variant="outline"
            color="accent"
          >{t`Next`}</Button>
        ) : (
          <Button
            startIcon={<IconPlus />}
            size="sm"
            onClick={onAddAccount}
            disabled={isSubmitting}
            variant="solid"
            color="accent"
          >{t`Add account`}</Button>
        )
      }
    >
      <SettingsPageContainer>
        <SettingsAccountsMessageChannelDetails
          messageChannel={messageChannel}
        />
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
