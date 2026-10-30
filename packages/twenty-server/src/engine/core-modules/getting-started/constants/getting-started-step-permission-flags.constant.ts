import { PermissionFlagType } from 'twenty-shared/constants';

import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

export const GETTING_STARTED_STEP_PERMISSION_FLAGS: Record<
  GettingStartedStepActionKey,
  PermissionFlagType[]
> = {
  [GettingStartedStepActionKey.CONNECT_MAILBOX]: [
    PermissionFlagType.CONNECTED_ACCOUNTS,
  ],
  [GettingStartedStepActionKey.IMPORT_DATA]: [PermissionFlagType.IMPORT_CSV],
  [GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL]: [
    PermissionFlagType.DATA_MODEL,
    PermissionFlagType.AI,
  ],
  [GettingStartedStepActionKey.INSTALL_APP]: [PermissionFlagType.APPLICATIONS],
  [GettingStartedStepActionKey.INVITE_TEAM]: [
    PermissionFlagType.WORKSPACE_MEMBERS,
  ],
  [GettingStartedStepActionKey.HANDOVER_DEALS]: [PermissionFlagType.WORKFLOWS],
  [GettingStartedStepActionKey.FOLLOW_UP_DEALS]: [PermissionFlagType.AI],
};
