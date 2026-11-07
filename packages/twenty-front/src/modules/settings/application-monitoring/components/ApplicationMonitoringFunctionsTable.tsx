import { useLingui } from '@lingui/react/macro';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { APPLICATION_MONITORING_TABLE_METRIC_COLUMNS } from '@/settings/application-monitoring/constants/ApplicationMonitoringTableMetricColumns';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';

const FUNCTIONS_GRID_TEMPLATE_COLUMNS = `minmax(0, 1fr) ${APPLICATION_MONITORING_TABLE_METRIC_COLUMNS}`;

type ApplicationMonitoringFunctionsTableProps = {
  functions: ApplicationMonitoringData['functions'];
};

export const ApplicationMonitoringFunctionsTable = ({
  functions,
}: ApplicationMonitoringFunctionsTableProps) => {
  const { t, i18n } = useLingui();

  if (functions.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No function ran in this period`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <Table>
      <TableRow gridTemplateColumns={FUNCTIONS_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Function`}</TableHeader>
        <TableHeader align="right">{t`Runs`}</TableHeader>
        <TableHeader align="right">{t`Failed`}</TableHeader>
        <TableHeader align="right">{t`p95 duration`}</TableHeader>
      </TableRow>
      <TableBody>
        {functions.map((logicFunction) => {
          const p95DurationInMs = i18n.number(logicFunction.p95DurationMs);

          return (
            <TableRow
              key={logicFunction.logicFunctionName}
              gridTemplateColumns={FUNCTIONS_GRID_TEMPLATE_COLUMNS}
            >
              <TableCell
                color={themeCssVariables.font.color.primary}
                overflow="hidden"
              >
                <OverflowingTextWithTooltip
                  text={logicFunction.logicFunctionName}
                />
              </TableCell>
              <TableCell align="right">
                {i18n.number(logicFunction.runCount)}
              </TableCell>
              <TableCell
                align="right"
                color={
                  logicFunction.failedRunCount > 0
                    ? themeCssVariables.color.red
                    : themeCssVariables.font.color.tertiary
                }
              >
                {i18n.number(logicFunction.failedRunCount)}
              </TableCell>
              <TableCell
                align="right"
                color={themeCssVariables.font.color.tertiary}
              >
                {t`${p95DurationInMs} ms`}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
