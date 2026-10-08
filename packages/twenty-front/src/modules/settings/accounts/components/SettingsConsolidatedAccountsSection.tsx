import { SettingsAccountGroupMenu } from '@/settings/accounts/components/SettingsAccountGroupMenu';
import { SettingsAccountsListEmptyStateCard } from '@/settings/accounts/components/SettingsAccountsListEmptyStateCard';
import { useConnectedAccountGroupTabDisplay } from '@/settings/accounts/hooks/useConnectedAccountGroupTabDisplay';
import { useConsolidatedAccountChannels } from '@/settings/accounts/hooks/useConsolidatedAccountChannels';
import { useConsolidatedConnectedAccounts } from '@/settings/accounts/hooks/useConsolidatedConnectedAccounts';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { getConnectedAccountGroupTabs } from '@/settings/accounts/utils/getConnectedAccountGroupTabs';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ConnectedAccountProvider, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import {
  IconAt,
  IconGoogle,
  IconMicrosoft,
  IconMicrosoftOutlook,
  IconPlus,
} from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { Link } from 'react-router-dom';

const StyledAccount = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;
const StyledIdentity = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;
const StyledRow = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: minmax(0, 1fr) ${themeCssVariables.spacing[8]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;
const StyledFooter = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]};
`;
const StyledHeaderText = styled.span`
  white-space: nowrap;
`;
const StyledUsage = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  max-width: ${themeCssVariables.spacing[24]};
`;

export const SettingsConsolidatedAccountsSection = () => {
  const { t } = useLingui();
  const { accounts, groups, loading, error, refetch } =
    useConsolidatedConnectedAccounts();
  const channels = useConsolidatedAccountChannels(accounts);
  const { getTabDisplay } = useConnectedAccountGroupTabDisplay();

  return (
    <Section.Root>
      <Section.Header
        title={t`Accounts`}
        description={t`Shared accounts between apps`}
      />
      {(isDefined(error) || isDefined(channels.error)) && (
        <>
          <InlineBanner
            status="error"
            layout="compact"
          >{t`Account connections could not be loaded. Some settings may be unavailable.`}</InlineBanner>
          <Button
            variant="outline"
            onClick={() => Promise.all([refetch(), channels.refetch()])}
          >{t`Retry`}</Button>
        </>
      )}
      {loading ? (
        <SettingsSectionSkeletonLoader />
      ) : groups.length === 0 ? (
        !isDefined(error) && <SettingsAccountsListEmptyStateCard />
      ) : (
        <Table>
          <TableRow
            gridTemplateColumns={`minmax(0, 1fr) ${themeCssVariables.spacing[24]} ${themeCssVariables.spacing[8]}`}
          >
            <TableHeader>{t`Account`}</TableHeader>
            <TableHeader>
              <StyledHeaderText>{t`Used by`}</StyledHeaderText>
            </TableHeader>
            <TableHeader />
          </TableRow>
          {groups.map((group) => {
            const nativeAccount = group.accounts.find(
              (account) => account.provider !== ConnectedAccountProvider.APP,
            );
            const ProviderIcon =
              nativeAccount?.provider === ConnectedAccountProvider.GOOGLE
                ? IconGoogle
                : nativeAccount?.provider === ConnectedAccountProvider.MICROSOFT
                  ? IconMicrosoft
                  : IconAt;
            const tabs = getConnectedAccountGroupTabs({
              accounts: group.accounts,
              messageChannels: channels.messageChannels,
              calendarChannels: channels.calendarChannels,
            });
            const microsoftTab = tabs.find(
              (tab) =>
                (tab.type === 'email' || tab.type === 'calendar') &&
                tab.provider === ConnectedAccountProvider.MICROSOFT,
            );
            const usedBy = tabs.filter(
              (tab) =>
                tab.type !== 'connection' &&
                (tab.type === 'app' ||
                  tab.provider !== ConnectedAccountProvider.MICROSOFT ||
                  tab.id === microsoftTab?.id),
            );
            const isArchived = group.accounts.some((account) =>
              isDefined(account.archivedAt),
            );
            const hasAuthFailure = group.accounts.some((account) =>
              isDefined(account.authFailedAt),
            );

            return (
              <StyledRow key={group.id}>
                <TableRow
                  to={getSettingsPath(SettingsPath.AccountDetail, {
                    accountGroupId: group.id,
                  })}
                  gridTemplateColumns={`minmax(0, 1fr) ${themeCssVariables.spacing[24]}`}
                >
                  <TableCell minWidth="0" height="auto">
                    <StyledAccount>
                      {isDefined(nativeAccount) ||
                      !isDefined(group.accounts[0].applicationId) ? (
                        <ProviderIcon size={16} />
                      ) : (
                        <AppChip
                          applicationId={group.accounts[0].applicationId}
                          fallbackApplicationData={{ name: t`Application` }}
                          chipOnly
                        />
                      )}
                      <StyledIdentity>
                        <OverflowingTextWithTooltip text={group.handle} />
                        {(isArchived || hasAuthFailure) && (
                          <Status color={hasAuthFailure ? 'red' : 'gray'}>
                            {hasAuthFailure
                              ? t`Reconnect needed`
                              : group.accounts.every((account) =>
                                    isDefined(account.archivedAt),
                                  )
                                ? t`Disconnected`
                                : t`Partially disconnected`}
                          </Status>
                        )}
                      </StyledIdentity>
                    </StyledAccount>
                  </TableCell>
                  <TableCell minWidth="0" height="auto">
                    <StyledUsage>
                      {channels.loading
                        ? t`Loading…`
                        : usedBy.map((tab) => {
                            const display =
                              (tab.type === 'email' ||
                                tab.type === 'calendar') &&
                              tab.provider ===
                                ConnectedAccountProvider.MICROSOFT
                                ? {
                                    title: t`Outlook`,
                                    icon: <IconMicrosoftOutlook size={16} />,
                                  }
                                : getTabDisplay(tab);

                            return (
                              <Tooltip key={tab.id} content={display.title}>
                                <span aria-label={display.title}>
                                  {display.icon}
                                </span>
                              </Tooltip>
                            );
                          })}
                    </StyledUsage>
                  </TableCell>
                </TableRow>
                <SettingsAccountGroupMenu group={group} />
              </StyledRow>
            );
          })}
          <StyledFooter>
            <Button
              variant="outline"
              size="sm"
              startIcon={<IconPlus />}
              href={getSettingsPath(SettingsPath.NewAccount)}
              render={<Link to={getSettingsPath(SettingsPath.NewAccount)} />}
            >{t`Add account`}</Button>
          </StyledFooter>
        </Table>
      )}
    </Section.Root>
  );
};
