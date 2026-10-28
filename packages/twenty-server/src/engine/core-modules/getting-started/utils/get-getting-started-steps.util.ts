import { GETTING_STARTED_TEAM_STEPS } from 'src/engine/core-modules/getting-started/constants/getting-started-team-steps.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { isWorkEmail } from 'src/utils/is-work-email';

export const getGettingStartedSteps = ({
  userEmail,
}: {
  userEmail: string;
}): GettingStartedStep[] =>
  Object.values(GettingStartedStep).filter(
    (step) =>
      isWorkEmail(userEmail) || !GETTING_STARTED_TEAM_STEPS.includes(step),
  );
