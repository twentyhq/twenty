import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme';

import { APPLICATION_MONITORING_TABLE_METRIC_COLUMNS } from '@/settings/application-monitoring/constants/ApplicationMonitoringTableMetricColumns';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const VERSIONS_GRID_TEMPLATE_COLUMNS = `minmax(0, 1fr) ${APPLICATION_MONITORING_TABLE_METRIC_COLUMNS}`;

type ApplicationMonitoringVersionsTableProps = {
  versions: ApplicationMonitoringData['versions'];
  activeLabel: string;
};

export const ApplicationMonitoringVersionsTable = ({
  versions,
  activeLabel,
}: ApplicationMonitoringVersionsTableProps) => {
  const { t, i18n } = useLingui();

  if (versions.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No version reported in this period`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <Table>
      <TableRow gridTemplateColumns={VERSIONS_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Version`}</TableHeader>
        <TableHeader align="right">{t`Runs`}</TableHeader>
        <TableHeader align="right">{t`Failed`}</TableHeader>
        <TableHeader align="right">{activeLabel}</TableHeader>
      </TableRow>
      <TableBody>
        {versions.map((version) => (
          <TableRow
            key={version.version}
            gridTemplateColumns={VERSIONS_GRID_TEMPLATE_COLUMNS}
          >
            <TableCell color={themeCssVariables.font.color.primary}>
              {version.version}
            </TableCell>
            <TableCell align="right">{i18n.number(version.runCount)}</TableCell>
            <TableCell
              align="right"
              color={
                version.failedRunCount > 0
                  ? themeCssVariables.color.red
                  : themeCssVariables.font.color.tertiary
              }
            >
              {i18n.number(version.failedRunCount)}
            </TableCell>
            <TableCell align="right">
              {i18n.number(version.activeInstallCount)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
