import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';
import { Tag } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { APPLICATION_MONITORING_TABLE_METRIC_COLUMNS } from '@/settings/application-monitoring/constants/ApplicationMonitoringTableMetricColumns';
import { SettingsEmptyPlaceholder } from '@/settings/components/SettingsEmptyPlaceholder';
import { type ApplicationMonitoringData } from '@/settings/application-monitoring/types/ApplicationMonitoringData';
import { getApplicationLogFunctionOrEventLabel } from '@/settings/application-monitoring/utils/getApplicationLogFunctionOrEventLabel';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const ISSUES_GRID_TEMPLATE_COLUMNS = `96px minmax(0, 1.4fr) minmax(0, 1fr) ${APPLICATION_MONITORING_TABLE_METRIC_COLUMNS}`;

const StyledIssueText = styled.div`
  min-width: 0;

  & [data-content-overflowing] {
    cursor: default;
  }
`;

type ApplicationMonitoringIssuesTableProps = {
  issues: ApplicationMonitoringData['issues'];
  affectedLabel: string;
};

export const ApplicationMonitoringIssuesTable = ({
  issues,
  affectedLabel,
}: ApplicationMonitoringIssuesTableProps) => {
  const { t, i18n } = useLingui();

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
          const functionOrEvent = getApplicationLogFunctionOrEventLabel(issue);

          return (
            <TableRow
              key={`${issue.level}-${issue.source}-${issue.errorCode}-${issue.logicFunctionName}`}
              gridTemplateColumns={ISSUES_GRID_TEMPLATE_COLUMNS}
            >
              <TableCell>
                <Tag color={issue.level === 'ERROR' ? 'red' : 'orange'}>
                  {issue.level === 'ERROR'
                    ? doNotTranslate('Error')
                    : doNotTranslate('Warning')}
                </Tag>
              </TableCell>
              <TableCell
                color={themeCssVariables.font.color.primary}
                overflow="hidden"
              >
                <StyledIssueText>
                  <OverflowingTextWithTooltip
                    text={
                      isNonEmptyString(issue.errorCode) ? issue.errorCode : '—'
                    }
                  />
                </StyledIssueText>
              </TableCell>
              <TableCell overflow="hidden">
                <StyledIssueText>
                  <OverflowingTextWithTooltip
                    text={[functionOrEvent, ...issue.versions].join(' · ')}
                  />
                </StyledIssueText>
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
