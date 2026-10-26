import { Trans, useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

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
      pageCommands={
        hasNextStep ? (
          <PageCommandEffect
            engineComponentKey={EngineComponentKey.NEXT_PAGE_STEP}
            onRun={onNext}
            isDisabled={isSubmitting}
          />
        ) : (
          <PageCommandEffect
            engineComponentKey={EngineComponentKey.ADD_CONNECTED_ACCOUNT}
            onRun={onAddAccount}
            isDisabled={isSubmitting}
          />
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
