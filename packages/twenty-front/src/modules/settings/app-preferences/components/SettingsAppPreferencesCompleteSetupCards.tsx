import { type ConnectedAccount } from '@/accounts/types/ConnectedAccount';
import { SettingsConnectedAccountIcon } from '@/settings/accounts/components/SettingsConnectedAccountIcon';
import { SettingsConnectedAccountSyncStatus } from '@/settings/app-preferences/components/SettingsConnectedAccountSyncStatus';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesCompleteSetupCardsProps = {
  accounts: ConnectedAccount[];
};

export const SettingsAppPreferencesCompleteSetupCards = ({
  accounts,
}: SettingsAppPreferencesCompleteSetupCardsProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <StyledCardsContainer>
      {accounts.map((account) => {
        const ProviderIcon = SettingsConnectedAccountIcon({ account });

        return (
          <SettingsCard
            key={account.id}
            Icon={<ProviderIcon size={theme.icon.size.md} />}
            title={account.handle}
            description={t`Complete setup to manage this account's settings`}
            Status={<SettingsConnectedAccountSyncStatus account={account} />}
            to={getSettingsPath(SettingsPath.AccountsConfiguration, {
              connectedAccountId: account.id,
            })}
          />
        );
      })}
    </StyledCardsContainer>
  );
};
