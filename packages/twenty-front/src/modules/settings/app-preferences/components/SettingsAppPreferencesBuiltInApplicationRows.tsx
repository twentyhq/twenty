import { useMyConnectedAccounts } from '@/settings/accounts/hooks/useMyConnectedAccounts';
import { APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsTable';
import { useBuiltInApps } from '@/settings/app-preferences/hooks/useBuiltInApps';
import { isAccountUsedByBuiltInApp } from '@/settings/app-preferences/utils/isAccountUsedByBuiltInApp';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const SettingsAppPreferencesBuiltInApplicationRows = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { builtInApps } = useBuiltInApps();
  const { accounts, loading } = useMyConnectedAccounts();

  if (loading) {
    return <SettingsSectionSkeletonLoader />;
  }

  return builtInApps.map((builtInApp) => (
    <TableRow
      key={builtInApp.id}
      to={getSettingsPath(SettingsPath.AppPreferencesBuiltInApplication, {
        builtInAppId: builtInApp.id,
      })}
      gridTemplateColumns={APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <builtInApp.Icon size={theme.icon.size.md} />
        <OverflowingTextWithTooltip text={builtInApp.name} />
      </TableCell>
      <TableCell align="right">
        {!accounts.some((account) =>
          isAccountUsedByBuiltInApp({ account, builtInApp }),
        ) && <Tag color="red" weight="medium">{t`Missing account`}</Tag>}
      </TableCell>
      <TableCell
        align="right"
        padding="0"
        color={themeCssVariables.font.color.tertiary}
      >
        <IconChevronRight size={theme.icon.size.md} />
      </TableCell>
    </TableRow>
  ));
};
