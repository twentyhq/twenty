import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-permission-flags.constant';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { hasEmailStepWithoutSender } from 'src/engine/core-modules/getting-started/utils/has-email-step-without-sender.util';

export const filterGettingStartedStepActionKeys = ({
  stepActionKeys,
  permissionFlags,
  hasSendingMailbox,
  hasFeaturedApp,
}: {
  stepActionKeys: GettingStartedStepActionKey[];
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
  hasSendingMailbox: boolean;
  hasFeaturedApp: boolean;
}): GettingStartedStepActionKey[] =>
  stepActionKeys.filter((stepActionKey) => {
    const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[stepActionKey];

    return (
      (hasFeaturedApp ||
        stepActionKey !== GettingStartedStepActionKey.INSTALL_APP) &&
      GETTING_STARTED_STEP_PERMISSION_FLAGS[stepActionKey].every(
        (permissionFlag) => permissionFlags[permissionFlag] === true,
      ) &&
      (hasSendingMailbox ||
        !isDefined(gettingStartedWorkflow) ||
        !hasEmailStepWithoutSender(gettingStartedWorkflow.manifest))
    );
  });
