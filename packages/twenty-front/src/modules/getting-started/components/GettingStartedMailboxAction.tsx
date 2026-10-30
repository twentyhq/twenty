import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { SettingsConnectedAccountsTableHeader } from '@/settings/accounts/components/SettingsConnectedAccountsTableHeader';
import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { SettingsConnectedAccountsTableRow } from '@/settings/components/SettingsConnectedAccountsTableRow';
import { Table } from '@/ui/layout/table/components/Table';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AppPath, ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconGoogle, IconLock, IconMicrosoft } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import {
  CalendarChannelVisibility,
  MessageChannelVisibility,
} from '~/generated-metadata/graphql';

const StyledColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledPrivacyNote = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledProviderButtons = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 1fr 1fr;
`;

export const GettingStartedMailboxAction = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const { accounts } = useMyConnectedAccounts();
  const activeAccounts = accounts.filter(
    (account) => !isDefined(account.archivedAt),
  );
  const isGoogleMessagingEnabled = useAtomStateValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useAtomStateValue(
    isMicrosoftMessagingEnabledState,
  );

  const connectMailbox = (provider: ConnectedAccountProvider) =>
    triggerApisOAuth(provider, {
      redirectLocation: AppPath.GettingStarted,
      messageVisibility: MessageChannelVisibility.METADATA,
      calendarVisibility: CalendarChannelVisibility.METADATA,
      skipMessageChannelConfiguration: true,
    });

  if (activeAccounts.length > 0) {
    return (
      <Table>
        <SettingsConnectedAccountsTableHeader />
        {activeAccounts.map((account) => (
          <SettingsConnectedAccountsTableRow
            key={account.id}
            account={account}
          />
        ))}
      </Table>
    );
  }

  return (
    <StyledColumn>
      <StyledPrivacyNote>
        <IconLock size={theme.icon.size.md} />
        {t`Teammates see who you talk to, not what you write.`}
      </StyledPrivacyNote>
      <StyledProviderButtons>
        <Button
          fullWidth
          disabled={!isGoogleMessagingEnabled}
          startIcon={<IconGoogle />}
          onClick={() => void connectMailbox(ConnectedAccountProvider.GOOGLE)}
        >{t`Continue with Google`}</Button>
        <Button
          fullWidth
          disabled={!isMicrosoftMessagingEnabled}
          startIcon={<IconMicrosoft />}
          onClick={() =>
            void connectMailbox(ConnectedAccountProvider.MICROSOFT)
          }
        >{t`Continue with Microsoft`}</Button>
      </StyledProviderButtons>
    </StyledColumn>
  );
};
