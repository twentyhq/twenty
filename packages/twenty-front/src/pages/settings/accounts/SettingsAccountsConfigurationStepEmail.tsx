import { Trans, useLingui } from '@lingui/react/macro';

import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { PageCommandEffect } from '@/command-menu-item/page-command/components/PageCommandEffect';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { useAccountsSettingsBreadcrumbLink } from '@/settings/app-preferences/hooks/useAccountsSettingsBreadcrumbLink';
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
  const accountsBreadcrumbLink = useAccountsSettingsBreadcrumbLink(
    <Trans>Account</Trans>,
  );

  return (
    <SettingsPageLayout
      title={t`1. Email`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        accountsBreadcrumbLink,
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
