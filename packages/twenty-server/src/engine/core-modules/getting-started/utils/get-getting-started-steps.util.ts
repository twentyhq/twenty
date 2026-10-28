import { type PermissionFlagType } from 'twenty-shared/constants';

import { GETTING_STARTED_STEP_PERMISSION_FLAGS } from 'src/engine/core-modules/getting-started/constants/getting-started-step-permission-flags.constant';
import { GETTING_STARTED_TEAM_STEPS } from 'src/engine/core-modules/getting-started/constants/getting-started-team-steps.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
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
  Object.values(GettingStartedStep).filter(
    (step) =>
      (isWorkEmail(userEmail) || !GETTING_STARTED_TEAM_STEPS.includes(step)) &&
      permissionFlags[GETTING_STARTED_STEP_PERMISSION_FLAGS[step]] === true &&
      (step !== GettingStartedStep.HANDOVER_DEALS || hasSendingMailbox),
  );
