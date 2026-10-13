import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowRunWorkflowFieldDisplay } from '@/object-core/workflows/components/CoreWorkflowRunWorkflowFieldDisplay';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';

export const CORE_WORKFLOW_RUN_FIELD_DISPLAY_OVERRIDES: RecordFieldDisplayOverride[] =
  [
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      fieldName: 'workflow',
      recordGqlFields: { coreWorkflowId: true },
      DisplayComponent: CoreWorkflowRunWorkflowFieldDisplay,
    },
  ];
