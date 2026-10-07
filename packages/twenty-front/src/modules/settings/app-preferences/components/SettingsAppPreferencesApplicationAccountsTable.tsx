import { AppChip } from '@/applications/components/AppChip';
import { SettingsAppPreferencesApplicationAccountStatus } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountStatus';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferencesConnectedAccount } from '@/settings/app-preferences/types/AppPreferencesConnectedAccount';
import { type AppPreferencesConnectionProvider } from '@/settings/app-preferences/types/AppPreferencesConnectionProvider';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconRefresh, IconUnlink } from 'twenty-ui/icon';
import { Pill } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const ACCOUNTS_GRID_TEMPLATE_COLUMNS = 'minmax(0, 180px) minmax(0, 1fr) 28px';

const StyledRow = styled(TableRow)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    && {
      grid-template-columns: minmax(0, 1fr) 28px;
    }
    > :nth-child(2) {
      grid-column: 1 / -1;
      grid-row: 2;
    }
    > :last-child {
      grid-column: 2;
      grid-row: 1;
    }
  }
`;

const StyledPermissionsHeader = styled(TableHeader)`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledAccountCell = styled(TableCell)`
  align-items: flex-start;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${themeCssVariables.spacing[1]};
  padding-top: ${themeCssVariables.spacing[1]};
`;

const StyledIdentity = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  width: 100%;
`;

const StyledRows = styled.div`
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsAppPreferencesApplicationAccountsTableProps = {
  application: AppPreferencesApplication;
  accounts: AppPreferencesConnectedAccount[];
  connectionProviders: AppPreferencesConnectionProvider[];
  canEditAccount: (account: AppPreferencesConnectedAccount) => boolean;
  onReconnect: (account: AppPreferencesConnectedAccount) => void;
  onDisconnect: (account: AppPreferencesConnectedAccount) => void;
  isPending: boolean;
  children: ReactNode;
};

export const SettingsAppPreferencesApplicationAccountsTable = ({
  application,
  accounts,
  connectionProviders,
  canEditAccount,
  onReconnect,
  onDisconnect,
  isPending,
  children,
}: SettingsAppPreferencesApplicationAccountsTableProps) => {
  const { t } = useLingui();

  return (
    <>
      <Table>
        <StyledRow gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}>
          <TableHeader>{t`Account`}</TableHeader>
          <StyledPermissionsHeader>{t`Permissions`}</StyledPermissionsHeader>
          <TableHeader />
        </StyledRow>
        <StyledRows>
          {accounts.length === 0 && (
            <SettingsEmptyPlaceholder>{t`No connected accounts`}</SettingsEmptyPlaceholder>
          )}
          {accounts.map((account) => {
            const provider = connectionProviders.find(
              ({ id }) => id === account.connectionProviderId,
            );

            return (
              <StyledRow
                key={account.id}
                gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}
              >
                <StyledAccountCell height="auto" minWidth="0" overflow="hidden">
                  <StyledIdentity>
                    <AppChip
                      applicationId={application.id}
                      logoUrl={provider?.logoUrl ?? application.logoUrl}
                      fallbackApplicationData={{
                        name: provider?.displayName ?? application.name,
                      }}
                      chipOnly
                    />
                    <OverflowingTextWithTooltip
                      text={
                        isNonEmptyString(account.name)
                          ? account.name
                          : account.handle
                      }
                    />
                  </StyledIdentity>
                  <SettingsAppPreferencesApplicationAccountStatus
                    account={account}
                  />
                  {account.visibility === 'workspace' && (
                    <Pill label={t`Shared account`} />
                  )}
                </StyledAccountCell>
                <TableCell minWidth="0" overflow="hidden">
                  <OverflowingTextWithTooltip
                    text={
                      isNonEmptyArray(account.scopes)
                        ? account.scopes.join(', ')
                        : t`Permissions unavailable`
                    }
                  />
                </TableCell>
                <TableCell align="right" padding="0">
                  {canEditAccount(account) && (
                    <DropdownRoot
                      type="menu"
                      dropdownId={`app-preferences-account-${account.id}`}
                    >
                      <Dropdown.Trigger
                        render={
                          <LightIconButton
                            aria-label={t`More options`}
                            disabled={isPending}
                          >
                            <IconDotsVertical />
                          </LightIconButton>
                        }
                      />
                      <DropdownContent side="right" align="start">
                        <Dropdown.Section>
                          <Dropdown.ActionItem
                            startIcon={<IconRefresh />}
                            disabled={
                              provider?.oauth?.isClientCredentialsConfigured !==
                                true || provider?.type !== 'oauth'
                            }
                            onClick={() => onReconnect(account)}
                          >{t`Reconnect`}</Dropdown.ActionItem>
                          {!isDefined(account.archivedAt) && (
                            <Dropdown.ActionItem
                              startIcon={<IconUnlink />}
                              onClick={() => onDisconnect(account)}
                            >{t`Disconnect account`}</Dropdown.ActionItem>
                          )}
                        </Dropdown.Section>
                      </DropdownContent>
                    </DropdownRoot>
                  )}
                </TableCell>
              </StyledRow>
            );
          })}
        </StyledRows>
      </Table>
      <StyledFooter>{children}</StyledFooter>
    </>
  );
};
