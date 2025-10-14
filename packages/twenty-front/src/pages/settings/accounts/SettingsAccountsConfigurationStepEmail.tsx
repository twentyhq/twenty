import { Trans, useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

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
    <SubMenuTopBarContainer
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
            Icon={IconChevronRight}
            title={t`Next`}
            accent="blue"
            size="small"
            variant="secondary"
            onClick={onNext}
            disabled={isSubmitting}
          />
        ) : (
          <Button
            Icon={IconPlus}
            title={t`Add account`}
            accent="blue"
            size="small"
            variant="primary"
            onClick={onAddAccount}
            disabled={isSubmitting}
          />
        )
      }
    >
      <SettingsPageContainer>
        <SettingsAccountsMessageChannelDetails
          messageChannel={messageChannel}
        />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
