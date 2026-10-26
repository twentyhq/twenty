import {
  type GettingStartedStepDefinition,
  GettingStartedStep,
  GettingStartedStepKind,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const mockGettingStartedSteps: GettingStartedStepDefinition[] = [
  {
    key: GettingStartedStep.CONNECT_MAILBOX,
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.CONNECTED_ACCOUNTS,
  },
  {
    key: GettingStartedStep.IMPORT_DATA,
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.IMPORT_CSV,
  },
  {
    key: GettingStartedStep.INSTALL_APP,
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.APPLICATIONS,
  },
  {
    key: GettingStartedStep.INVITE_TEAM,
    kind: GettingStartedStepKind.BUILT_IN,
    permissionFlag: PermissionFlagType.WORKSPACE_MEMBERS,
  },
  {
    key: GettingStartedStep.HANDOVER_DEALS,
    kind: GettingStartedStepKind.WORKFLOW,
    permissionFlag: PermissionFlagType.WORKFLOWS,
  },
  {
    key: GettingStartedStep.FOLLOW_UP_DEALS,
    kind: GettingStartedStepKind.AI_THREAD,
    permissionFlag: PermissionFlagType.AI,
  },
];
