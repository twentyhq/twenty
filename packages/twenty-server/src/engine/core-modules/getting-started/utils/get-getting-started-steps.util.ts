import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-permission-flags.constant';
import { GETTING_STARTED_TEAM_STEPS } from 'src/engine/core-modules/getting-started/constants/getting-started-team-steps.constant';
import { GETTING_STARTED_WORKFLOWS } from 'src/engine/core-modules/getting-started/constants/getting-started-workflows.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { hasEmailStepWithoutSender } from 'src/engine/core-modules/getting-started/utils/has-email-step-without-sender.util';
import { isWorkEmail } from 'src/utils/is-work-email';

export const getGettingStartedSteps = ({
  userEmail,
  permissionFlags,
  hasSendingMailbox,
}: {
  userEmail: string;
  permissionFlags: Partial<Record<PermissionFlagType, boolean>>;
  hasSendingMailbox: boolean;
}): GettingStartedStep[] =>
  Object.values(GettingStartedStep).filter((step) => {
    const gettingStartedWorkflow = GETTING_STARTED_WORKFLOWS[step];

    return (
      (isWorkEmail(userEmail) || !GETTING_STARTED_TEAM_STEPS.includes(step)) &&
      permissionFlags[GETTING_STARTED_STEP_PERMISSION_FLAGS[step]] === true &&
      (hasSendingMailbox ||
        !isDefined(gettingStartedWorkflow) ||
        !hasEmailStepWithoutSender(gettingStartedWorkflow.manifest))
    );
  });
