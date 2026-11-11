import { msg } from '@lingui/core/macro';
import {
  IconCalendarTime,
  IconShare,
  IconStatusChange,
  IconSum,
  IconTerminal,
  IconTextSize,
} from 'twenty-ui/icon';

import { CoreWorkflowNameCell } from '@/object-core/workflows/components/CoreWorkflowNameCell';
import { CoreWorkflowRecentRunsCell } from '@/object-core/workflows/components/CoreWorkflowRecentRunsCell';
import { CoreWorkflowRunCountCell } from '@/object-core/workflows/components/CoreWorkflowRunCountCell';
import { CoreWorkflowStatusesCell } from '@/object-core/workflows/components/CoreWorkflowStatusesCell';
import { CoreWorkflowVisibilityCell } from '@/object-core/workflows/components/CoreWorkflowVisibilityCell';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { type CoreWorkflowTableRow } from '@/object-core/workflows/types/CoreWorkflowTableRow';

export const WORKFLOW_CORE_TABLE_COLUMNS: CoreObjectTableColumn<CoreWorkflowTableRow>[] =
  [
    {
      fieldName: 'name',
      fieldLabel: msg`Name`,
      FieldIcon: IconTextSize,
      fieldType: 'string',
      align: 'left',
      gridTrack: 'minmax(200px, 1fr)',
      renderCell: (workflow) => (
        <CoreWorkflowNameCell name={workflow.name} workflowId={workflow.id} />
      ),
    },
    {
      fieldName: 'statuses',
      fieldLabel: msg`Statuses`,
      FieldIcon: IconStatusChange,
      align: 'left',
      gridTrack: '160px',
      renderCell: (workflow) => (
        <CoreWorkflowStatusesCell statuses={workflow.statuses} />
      ),
    },
    {
      fieldName: 'recentRuns',
      fieldLabel: msg`Recent runs`,
      FieldIcon: IconTerminal,
      align: 'left',
      gridTrack: '120px',
      renderCell: (workflow) => (
        <CoreWorkflowRecentRunsCell recentRuns={workflow.recentRuns} />
      ),
    },
    {
      fieldName: 'lastRunAt',
      fieldLabel: msg`Last run`,
      FieldIcon: IconCalendarTime,
      align: 'left',
      gridTrack: '150px',
      renderCell: (workflow) => (
        <DateTimeDisplay
          value={workflow.lastRunAt}
          dateFieldSettings={{ displayFormat: FieldDateDisplayFormat.RELATIVE }}
        />
      ),
    },
    {
      fieldName: 'runCountLast14Days',
      fieldLabel: msg`Runs · 14d`,
      FieldIcon: IconSum,
      align: 'right',
      gridTrack: '100px',
      renderCell: (workflow) => (
        <CoreWorkflowRunCountCell
          runCount={workflow.runCountLast14Days}
          isLowerBound={workflow.isRunCountLowerBound}
        />
      ),
    },
    {
      fieldName: 'visibility',
      fieldLabel: msg`Visibility`,
      FieldIcon: IconShare,
      align: 'left',
      gridTrack: '120px',
      renderCell: (workflow) => (
        <CoreWorkflowVisibilityCell visibility={workflow.visibility} />
      ),
    },
    {
      fieldName: 'updatedAt',
      fieldLabel: msg`Last update`,
      FieldIcon: IconCalendarTime,
      fieldType: 'string',
      align: 'left',
      gridTrack: '150px',
      renderCell: (workflow) => (
        <DateTimeDisplay
          value={workflow.updatedAt}
          dateFieldSettings={{ displayFormat: FieldDateDisplayFormat.RELATIVE }}
        />
      ),
    },
  ];
