import { AppChip } from '@/applications/components/AppChip';
import { APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS } from '@/settings/app-preferences/components/SettingsAppPreferencesAppsTable';
import { useMyAppPreferencesApplications } from '@/settings/app-preferences/hooks/useMyAppPreferencesApplications';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconChevronRight } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

export const SettingsAppPreferencesInstalledApplicationRows = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { applications, loading, error, refetch, isAppPreferencesEnabled } =
    useMyAppPreferencesApplications();

  if (!isAppPreferencesEnabled) {
    return null;
  }

  if (loading || isDefined(error)) {
    return (
      <TableRow gridTemplateColumns="minmax(0, 1fr) auto">
        <TableCell>
          {loading ? t`Loading apps…` : t`Unable to load app preferences.`}
        </TableCell>
        {isDefined(error) && (
          <TableCell align="right">
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              {t`Retry`}
            </Button>
          </TableCell>
        )}
      </TableRow>
    );
  }

  return applications.map((application) => (
    <TableRow
      key={application.id}
      gridTemplateColumns={APP_PREFERENCES_APPS_GRID_TEMPLATE_COLUMNS}
      to={getSettingsPath(SettingsPath.AppPreferencesApplication, {
        applicationId: application.id,
      })}
    >
      <TableCell
        color={themeCssVariables.font.color.primary}
        gap={themeCssVariables.spacing[2]}
        minWidth="0"
        overflow="hidden"
      >
        <AppChip
          applicationId={application.id}
          logoUrl={application.logoUrl}
          fallbackApplicationData={{ name: application.name }}
          size="md"
          chipOnly
        />
        <OverflowingTextWithTooltip text={application.name} />
      </TableCell>
      <TableCell />
      <TableCell align="right" padding="0">
        <IconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
          color={theme.font.color.light}
        />
      </TableCell>
    </TableRow>
  ));
};
