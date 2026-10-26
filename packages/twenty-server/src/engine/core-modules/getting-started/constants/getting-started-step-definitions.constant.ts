import { PermissionFlagType } from 'twenty-shared/constants';

import { GETTING_STARTED_HANDOVER_WORKFLOW_TEMPLATE } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-workflow-template.constant';
import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedStepDefinition } from 'src/engine/core-modules/getting-started/types/getting-started-step-definition.type';

export const GETTING_STARTED_STEP_DEFINITIONS: Record<
  GettingStartedStep,
  GettingStartedStepDefinition
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: {
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.CONNECTED_ACCOUNTS,
    isClientCompletable: false,
  },
  [GettingStartedStep.IMPORT_DATA]: {
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.IMPORT_CSV,
    isClientCompletable: true,
  },
  [GettingStartedStep.INSTALL_APP]: {
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.APPLICATIONS,
    isClientCompletable: false,
  },
  [GettingStartedStep.INVITE_TEAM]: {
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.WORKSPACE_MEMBERS,
    isClientCompletable: false,
  },
  [GettingStartedStep.HANDOVER_DEALS]: {
    kind: GettingStartedStepKind.WORKFLOW,
    permissionFlag: PermissionFlagType.WORKFLOWS,
    isClientCompletable: false,
    workflowTemplate: GETTING_STARTED_HANDOVER_WORKFLOW_TEMPLATE,
  },
  [GettingStartedStep.FOLLOW_UP_DEALS]: {
    kind: GettingStartedStepKind.AI_THREAD,
    permissionFlag: PermissionFlagType.AI,
    isClientCompletable: true,
  },
};
