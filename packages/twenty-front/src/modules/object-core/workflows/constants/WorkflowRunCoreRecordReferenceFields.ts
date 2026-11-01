import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowChip } from '@/object-core/workflows/components/CoreWorkflowChip';
import { type CoreRecordReferenceField } from '@/object-record/record-field/ui/types/CoreRecordReferenceField';

export const WORKFLOW_RUN_CORE_RECORD_REFERENCE_FIELDS: CoreRecordReferenceField[] =
  [
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      fieldName: 'workflow',
      coreRecordIdFieldName: 'coreWorkflowId',
      CoreRecordDisplay: CoreWorkflowChip,
    },
  ];
