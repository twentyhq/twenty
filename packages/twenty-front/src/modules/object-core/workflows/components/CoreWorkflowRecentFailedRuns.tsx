import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  IconAlertTriangle,
  IconCalendarTime,
  IconTextSize,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';

import {
  CoreObjectTableBody,
  CoreObjectTableRow,
} from '@/object-core/components/CoreObjectTableRow';
import { CORE_WORKFLOW_FAILED_RUNS_GRID_TEMPLATE_COLUMNS } from '@/object-core/workflows/constants/CoreWorkflowFailedRunsGridTemplateColumns';
import { handleCoreObjectTableRowKeyDown } from '@/object-core/utils/handleCoreObjectTableRowKeyDown';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableHeaderText } from '@/ui/layout/table/components/TableHeaderText';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { type GetCoreWorkflowRunInsightsQuery } from '~/generated/graphql';

type FailedRun = NonNullable<
  GetCoreWorkflowRunInsightsQuery['coreWorkflowRunInsights']
>['recentFailedRuns'][number];

const StyledEmpty = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

type CoreWorkflowRecentFailedRunsProps = {
  failedRuns: FailedRun[];
};

export const CoreWorkflowRecentFailedRuns = ({
  failedRuns,
}: CoreWorkflowRecentFailedRunsProps) => {
  const { t } = useLingui();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  if (failedRuns.length === 0) {
    return <StyledEmpty>{t`No failed runs`}</StyledEmpty>;
  }

  return (
    <Table>
      <TableRow
        gridTemplateColumns={CORE_WORKFLOW_FAILED_RUNS_GRID_TEMPLATE_COLUMNS}
      >
        <TableHeader>
          <IconTextSize size={14} />
          <TableHeaderText>{t`Name`}</TableHeaderText>
        </TableHeader>
        <TableHeader>
          <IconCalendarTime size={14} />
          <TableHeaderText>{t`Started`}</TableHeaderText>
        </TableHeader>
        <TableHeader>
          <IconAlertTriangle size={14} />
          <TableHeaderText>{t`Error`}</TableHeaderText>
        </TableHeader>
      </TableRow>
      <CoreObjectTableBody>
        {failedRuns.map((failedRun) => {
          const openRun = () =>
            openRecordInSidePanel({
              recordId: failedRun.id,
              objectNameSingular: StandardObjectNameSingular.WorkflowRun,
            });

          return (
            <CoreObjectTableRow
              key={failedRun.id}
              gridTemplateColumns={
                CORE_WORKFLOW_FAILED_RUNS_GRID_TEMPLATE_COLUMNS
              }
              onClick={openRun}
              onKeyDown={handleCoreObjectTableRowKeyDown(openRun)}
              role="button"
              tabIndex={0}
            >
              <TableCell overflow="hidden">
                <OverflowingTextWithTooltip text={failedRun.name} />
              </TableCell>
              <TableCell color={themeCssVariables.font.color.secondary}>
                <DateTimeDisplay
                  value={failedRun.createdAt}
                  dateFieldSettings={{
                    displayFormat: FieldDateDisplayFormat.RELATIVE,
                  }}
                />
              </TableCell>
              <TableCell
                overflow="hidden"
                color={themeCssVariables.font.color.secondary}
              >
                <OverflowingTextWithTooltip text={failedRun.errorMessage} />
              </TableCell>
            </CoreObjectTableRow>
          );
        })}
      </CoreObjectTableBody>
    </Table>
  );
};
