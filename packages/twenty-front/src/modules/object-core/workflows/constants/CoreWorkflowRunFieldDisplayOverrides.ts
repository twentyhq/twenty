import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreWorkflowRunWorkflowFieldDisplay } from '@/object-core/workflows/components/CoreWorkflowRunWorkflowFieldDisplay';
import { type RecordFieldDisplayOverride } from '@/object-record/record-field/ui/types/RecordFieldDisplayOverride';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const CORE_WORKFLOW_RUN_FIELD_DISPLAY_OVERRIDES: RecordFieldDisplayOverride[] =
  [
    {
      objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      fieldName: 'workflow',
      featureFlagKey: FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
      recordGqlFields: { coreWorkflowId: true },
      DisplayComponent: CoreWorkflowRunWorkflowFieldDisplay,
    },
  ];
