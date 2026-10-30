import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-permission-flags.constant';
import { GETTING_STARTED_STEPS_BY_PROFILE } from 'src/engine/core-modules/getting-started/constants/getting-started-steps-by-profile.constant';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedProfile } from 'src/engine/core-modules/getting-started/types/getting-started-profile.type';
import { hasEmailStepWithoutSender } from 'src/engine/core-modules/getting-started/utils/has-email-step-without-sender.util';

export const getGettingStartedSteps = ({
  profile,
  permissionFlags,
  hasSendingMailbox,
  hasFeaturedApp,
}: {
  profile: GettingStartedProfile;
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
  hasSendingMailbox: boolean;
  hasFeaturedApp: boolean;
}): GettingStartedStep[] =>
  GETTING_STARTED_STEPS_BY_PROFILE[profile].filter((step) => {
    const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[step];

    return (
      (hasFeaturedApp || step !== GettingStartedStep.INSTALL_APP) &&
      GETTING_STARTED_STEP_PERMISSION_FLAGS[step].every(
        (permissionFlag) => permissionFlags[permissionFlag] === true,
      ) &&
      (hasSendingMailbox ||
        !isDefined(gettingStartedWorkflow) ||
        !hasEmailStepWithoutSender(gettingStartedWorkflow.manifest))
    );
  });
