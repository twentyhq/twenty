import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { getApplicationLogSourceLabel } from '@/settings/application-monitoring/utils/getApplicationLogSourceLabel';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const ISSUES_GRID_TEMPLATE_COLUMNS =
  '96px minmax(0, 1.4fr) minmax(0, 1fr) 64px 72px 136px';

type ApplicationMonitoringIssuesTableProps = {
  issues: ApplicationMonitoringData['issues'];
  affectedLabel: string;
};

export const ApplicationMonitoringIssuesTable = ({
  issues,
  affectedLabel,
}: ApplicationMonitoringIssuesTableProps) => {
  const { t, i18n } = useLingui();

  const getFunctionOrEventLabel = ({
    logicFunctionName,
    source,
  }: Pick<
    ApplicationMonitoringData['issues'][number],
    'logicFunctionName' | 'source'
  >) => {
    if (isNonEmptyString(logicFunctionName)) {
      return logicFunctionName;
    }

    const sourceLabel = getApplicationLogSourceLabel(source);

    return isDefined(sourceLabel) ? i18n._(sourceLabel) : source;
  };

  if (issues.length === 0) {
    return (
      <SettingsEmptyPlaceholder>{t`No errors or warnings in this period`}</SettingsEmptyPlaceholder>
    );
  }

  return (
    <Table>
      <TableRow gridTemplateColumns={ISSUES_GRID_TEMPLATE_COLUMNS}>
        <TableHeader>{t`Level`}</TableHeader>
        <TableHeader>{t`Error`}</TableHeader>
        <TableHeader>{t`Function / event`}</TableHeader>
        <TableHeader align="right">{t`Events`}</TableHeader>
        <TableHeader align="right">{affectedLabel}</TableHeader>
        <TableHeader align="right">{t`Last seen`}</TableHeader>
      </TableRow>
      <TableBody>
        {issues.map((issue) => {
          const functionOrEvent = getFunctionOrEventLabel(issue);

          return (
            <TableRow
              key={`${issue.level}-${issue.source}-${issue.errorCode}-${issue.logicFunctionName}`}
              gridTemplateColumns={ISSUES_GRID_TEMPLATE_COLUMNS}
            >
              <TableCell>
                <Tag color={issue.level === 'ERROR' ? 'red' : 'orange'}>
                  {issue.level === 'ERROR' ? t`Error` : t`Warning`}
                </Tag>
              </TableCell>
              <TableCell
                color={themeCssVariables.font.color.primary}
                overflow="hidden"
              >
                <OverflowingTextWithTooltip
                  text={
                    isNonEmptyString(issue.errorCode) ? issue.errorCode : '—'
                  }
                />
              </TableCell>
              <TableCell overflow="hidden">
                <OverflowingTextWithTooltip
                  text={[functionOrEvent, ...issue.versions].join(' · ')}
                />
              </TableCell>
              <TableCell align="right">
                {i18n.number(issue.eventCount)}
              </TableCell>
              <TableCell align="right">
                {i18n.number(issue.affectedInstallCount)}
              </TableCell>
              <TableCell
                align="right"
                color={themeCssVariables.font.color.tertiary}
              >
                {beautifyPastDateRelativeToNow(issue.lastSeenAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
