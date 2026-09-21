import { msg } from '@lingui/core/macro';

import { CoreWorkflowNameCell } from '@/object-core/workflows/components/CoreWorkflowNameCell';
import { CoreWorkflowStatusesCell } from '@/object-core/workflows/components/CoreWorkflowStatusesCell';
import { CoreWorkflowVisibilityCell } from '@/object-core/workflows/components/CoreWorkflowVisibilityCell';
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
      renderCell: (workflow) => (
        <CoreWorkflowNameCell name={workflow.name} workflowId={workflow.id} />
      ),
    },
    {
      fieldName: 'statuses',
      fieldLabel: msg`Statuses`,
      align: 'left',
      gridTrack: '160px',
      renderCell: (workflow) => (
        <CoreWorkflowStatusesCell statuses={workflow.statuses} />
      ),
    },
    {
      fieldName: 'visibility',
      fieldLabel: msg`Visibility`,
      align: 'left',
      gridTrack: '140px',
      renderCell: (workflow) => (
        <CoreWorkflowVisibilityCell visibility={workflow.visibility} />
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
