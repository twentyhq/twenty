import { msg } from '@lingui/core/macro';

import { AppChip } from '@/applications/components/AppChip';
import { CoreWorkflowNameCell } from '@/object-core/workflows/components/CoreWorkflowNameCell';
import { CoreWorkflowStatusesCell } from '@/object-core/workflows/components/CoreWorkflowStatusesCell';
import { type CoreObjectTableColumn } from '@/object-core/types/CoreObjectTableColumn';
import { DateTimeDisplay } from '@/ui/field/display/components/DateTimeDisplay';
import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';

export const WORKFLOW_CORE_TABLE_COLUMNS: CoreObjectTableColumn<CoreWorkflow>[] =
  [
    {
      fieldName: 'name',
      fieldLabel: msg`Name`,
      fieldType: 'string',
      align: 'left',
      gridTrack: 'minmax(0, 1fr)',
      renderCell: (workflow) => <CoreWorkflowNameCell name={workflow.name} />,
    },
    {
      fieldName: 'statuses',
      fieldLabel: msg`Status`,
      align: 'left',
      gridTrack: '160px',
      renderCell: (workflow) => (
        <CoreWorkflowStatusesCell statuses={workflow.statuses} />
      ),
    },
    {
      fieldName: 'applicationId',
      fieldLabel: msg`App`,
      align: 'left',
      gridTrack: '160px',
      renderCell: (workflow) => (
        <AppChip applicationId={workflow.applicationId} />
      ),
    },
    {
      fieldName: 'updatedAt',
      fieldLabel: msg`Last update`,
      fieldType: 'string',
      align: 'left',
      gridTrack: '180px',
      renderCell: (workflow) => <DateTimeDisplay value={workflow.updatedAt} />,
    },
  ];
