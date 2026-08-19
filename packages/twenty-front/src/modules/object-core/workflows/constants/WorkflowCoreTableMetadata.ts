import { msg } from '@lingui/core/macro';

import { type CoreWorkflow } from '@/object-core/workflows/types/CoreWorkflow';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';

export const WORKFLOW_CORE_TABLE_METADATA: TableMetadata<CoreWorkflow> = {
  tableId: 'workflowCore',
  fields: [
    {
      fieldLabel: msg`Name`,
      fieldName: 'name',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`Status`,
      fieldName: 'status',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`App`,
      fieldName: 'applicationName',
      fieldType: 'string',
      align: 'left',
    },
    {
      fieldLabel: msg`Last update`,
      fieldName: 'updatedAt',
      fieldType: 'string',
      align: 'left',
    },
  ],
  initialSort: {
    fieldName: 'updatedAt',
    orderBy: 'DescNullsLast',
  },
};
