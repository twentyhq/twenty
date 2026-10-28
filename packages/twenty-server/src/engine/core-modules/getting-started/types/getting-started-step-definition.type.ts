import { type PermissionFlagType } from 'twenty-shared/constants';

import { type GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { type GettingStartedWorkflowTemplate } from 'src/engine/core-modules/getting-started/types/getting-started-workflow-template.type';

export type GettingStartedStepDefinition = {
  permissionFlag: PermissionFlagType;
} & (
  | {
      kind: GettingStartedStepKind.BUILT_IN | GettingStartedStepKind.AI_THREAD;
    }
  | {
      kind: GettingStartedStepKind.WORKFLOW;
      workflowTemplate: GettingStartedWorkflowTemplate;
    }
);
