import {
  GettingStartedStep,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

export const GETTING_STARTED_STEP_PERMISSION_FLAGS: Record<
  GettingStartedStep,
  PermissionFlagType
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: PermissionFlagType.CONNECTED_ACCOUNTS,
  [GettingStartedStep.IMPORT_DATA]: PermissionFlagType.IMPORT_CSV,
  [GettingStartedStep.INSTALL_APP]: PermissionFlagType.APPLICATIONS,
  [GettingStartedStep.INVITE_TEAM]: PermissionFlagType.WORKSPACE_MEMBERS,
  [GettingStartedStep.HANDOVER_DEALS]: PermissionFlagType.WORKFLOWS,
  [GettingStartedStep.FOLLOW_UP_DEALS]: PermissionFlagType.AI,
};
