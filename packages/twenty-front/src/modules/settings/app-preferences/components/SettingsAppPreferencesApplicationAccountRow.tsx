import { AppChip } from '@/applications/components/AppChip';
import {
  ACCOUNTS_GRID_TEMPLATE_COLUMNS,
  StyledAccountLink,
  StyledAccountMenuCell,
  StyledAccountsTableRow,
} from '@/settings/accounts/components/SettingsAccountsConnectedAccountsTable';
import { SettingsAppPreferencesApplicationAccountStatus } from '@/settings/app-preferences/components/SettingsAppPreferencesApplicationAccountStatus';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferencesConnectedAccount } from '@/settings/app-preferences/types/AppPreferencesConnectedAccount';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconDotsVertical, IconSettings } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsAppPreferencesApplicationAccountRowProps = {
  account: AppPreferencesConnectedAccount;
  application: AppPreferencesApplication;
};

export const SettingsAppPreferencesApplicationAccountRow = ({
  account,
  application,
}: SettingsAppPreferencesApplicationAccountRowProps) => {
  const { t } = useLingui();

  return (
    <StyledAccountsTableRow
      gridTemplateColumns={ACCOUNTS_GRID_TEMPLATE_COLUMNS}
      isClickable
      hoverBackgroundColor={themeCssVariables.background.transparent.light}
    >
      <TableCell
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
        color={themeCssVariables.font.color.primary}
      >
        <StyledAccountLink
          to={getSettingsPath(SettingsPath.AppPreferencesAccount, {
            connectedAccountId: account.id,
          })}
        >
          <AppChip
            applicationId={application.id}
            logoUrl={application.logoUrl}
            fallbackApplicationData={{ name: application.name }}
            chipOnly
          />
          <OverflowingTextWithTooltip
            text={
              isNonEmptyString(account.name) ? account.name : account.handle
            }
          />
        </StyledAccountLink>
      </TableCell>
      <TableCell align="right">
        <SettingsAppPreferencesApplicationAccountStatus account={account} />
      </TableCell>
      <TableCell align="right">
        <span role="img" aria-label={application.name} title={application.name}>
          <AppChip
            applicationId={application.id}
            logoUrl={application.logoUrl}
            fallbackApplicationData={{ name: application.name }}
            size="md"
            chipOnly
          />
        </span>
      </TableCell>
      <StyledAccountMenuCell align="right" padding="0">
        <DropdownRoot
          type="menu"
          dropdownId={`app-preferences-overview-account-${account.id}`}
        >
          <Dropdown.Trigger
            render={
              <LightIconButton aria-label={t`More options`}>
                <IconDotsVertical />
              </LightIconButton>
            }
          />
          <DropdownContent side="right" align="start">
            <Dropdown.Section>
              <Dropdown.ActionItem
                startIcon={<IconSettings />}
                render={
                  <Link
                    to={getSettingsPath(
                      SettingsPath.AppPreferencesApplication,
                      { applicationId: application.id },
                    )}
                  />
                }
              >{t`App preferences`}</Dropdown.ActionItem>
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      </StyledAccountMenuCell>
    </StyledAccountsTableRow>
  );
};
