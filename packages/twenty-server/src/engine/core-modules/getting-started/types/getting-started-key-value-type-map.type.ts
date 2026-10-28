import { GETTING_STARTED_HIDDEN_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-hidden-user-var-key.constant';
import { GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-selected-step-user-var-key.constant';
import { GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-snoozed-until-user-var-key.constant';
import { GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-step-user-var-key-prefix.constant';
import { GETTING_STARTED_STEPS_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-steps-user-var-key.constant';
import { GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-workflow-user-var-key-prefix.constant';
import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedTrack } from 'src/engine/core-modules/getting-started/enums/getting-started-track.enum';

export type GettingStartedKeyValueTypeMap = {
  [
    Key in `${typeof GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${GettingStartedStep}`
  ]: {
    completedAt: string;
    threadId?: string;
  };
} & {
  [
    Key in `${typeof GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${GettingStartedStep}`
  ]: GettingStartedWorkflowDTO;
} & {
  [GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY]: GettingStartedStep;
  [GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY]: string | null;
  [GETTING_STARTED_HIDDEN_USER_VAR_KEY]: boolean;
  [GETTING_STARTED_STEPS_USER_VAR_KEY]: {
    track: GettingStartedTrack;
    steps: GettingStartedStep[];
    preparedAt: string;
  };
};
