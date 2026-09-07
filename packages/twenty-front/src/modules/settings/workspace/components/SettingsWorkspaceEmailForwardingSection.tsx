import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';

import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  hasEmailForwardingScopes,
  isDefined,
} from 'twenty-shared/utils';
import { Status } from 'twenty-ui/data-display';
import { IconGoogle, IconMicrosoft } from 'twenty-ui/icon';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

const StyledCardsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsWorkspaceEmailForwardingSection = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts } = useMyConnectedAccounts();

  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const providers = [
    {
      provider: ConnectedAccountProvider.GOOGLE,
      label: t`Google Workspace`,
      Icon: IconGoogle,
      isEnabled: isGoogleMessagingEnabled,
    },
    {
      provider: ConnectedAccountProvider.MICROSOFT,
      label: t`Microsoft 365`,
      Icon: IconMicrosoft,
      isEnabled: isMicrosoftMessagingEnabled,
    },
  ].filter(({ isEnabled }) => isEnabled);

  if (providers.length === 0) {
    return null;
  }

  const connectForwardingProvider = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: getSettingsPath(SettingsPath.WorkspaceCommunications),
      shouldRequestEmailForwardingScopes: true,
    });

  return (
    <Section>
      <H2Title
        title={t`Automatic forwarding`}
        description={t`Connect an administrator account and Twenty sets up forwarding for every shared address itself. You need to be an administrator of your Google Workspace or Microsoft 365 tenant to do this.`}
      />
      <StyledCardsColumn>
        {providers.map(({ provider, label, Icon }) => {
          const connectedAccount = accounts.find(
            (account) =>
              account.provider === provider &&
              hasEmailForwardingScopes(account),
          );

          return (
            <SettingsCard
              key={provider}
              Icon={<Icon size={theme.icon.size.md} />}
              title={label}
              description={
                connectedAccount?.handle ??
                t`Connect to create forwarding addresses automatically`
              }
              Status={
                isDefined(connectedAccount) ? (
                  <Status color="green" text={t`Connected`} />
                ) : undefined
              }
              onClick={() => connectForwardingProvider(provider)}
            />
          );
        })}
      </StyledCardsColumn>
    </Section>
  );
};
