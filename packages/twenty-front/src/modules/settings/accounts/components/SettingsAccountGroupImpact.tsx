import { AppChip } from '@/applications/components/AppChip';
import { useConnectedAccountAdministration } from '@/settings/accounts/hooks/useConnectedAccountAdministration';
import { useConnectedAccountLabel } from '@/settings/accounts/hooks/useConnectedAccountLabel';
import { type ConsolidatedConnectedAccount } from '@/settings/accounts/types/ConsolidatedConnectedAccount';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledImpactList = styled.ul`
  list-style: none;
  margin: ${themeCssVariables.spacing[3]} 0;
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
  text-align: left;

  li {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${themeCssVariables.spacing[2]};
    padding: ${themeCssVariables.spacing[1]} 0;
  }
`;

type SettingsAccountGroupImpactProps = {
  accounts: ConsolidatedConnectedAccount[];
  operation: 'delete' | 'disconnect';
};

export const SettingsAccountGroupImpact = ({
  accounts,
  operation,
}: SettingsAccountGroupImpactProps) => {
  const { t } = useLingui();
  const { canManageAccount } = useConnectedAccountAdministration();
  const { getConnectionLabel } = useConnectedAccountLabel();

  return (
    <>
      {operation === 'delete'
        ? t`Connections marked Delete will be removed, along with their native synced emails and events. Installed apps will remain installed.`
        : t`Connections marked Disconnect will stop syncing and their credentials will be removed. Native emails and events will be retained. Installed apps will remain installed.`}
      <StyledImpactList aria-label={t`Affected connections`}>
        {accounts.map((account, index) => (
          <li key={account.id}>
            {account.provider === ConnectedAccountProvider.APP ? (
              <AppChip
                applicationId={account.applicationId}
                fallbackApplicationData={{ name: t`Application` }}
              />
            ) : account.provider === ConnectedAccountProvider.GOOGLE ? (
              t`Google`
            ) : account.provider === ConnectedAccountProvider.MICROSOFT ? (
              t`Microsoft`
            ) : account.provider === ConnectedAccountProvider.EMAIL_GROUP ? (
              t`Email group`
            ) : (
              t`IMAP / SMTP / CalDAV`
            )}
            <span>{getConnectionLabel({ account, index })}</span>
            <span>
              {!canManageAccount(account)
                ? t`Retained — shared, managed by its owner`
                : operation === 'disconnect' && isDefined(account.archivedAt)
                  ? t`Already disconnected`
                  : operation === 'delete'
                    ? t`Delete`
                    : t`Disconnect`}
            </span>
          </li>
        ))}
      </StyledImpactList>
    </>
  );
};
