import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

export const GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX = 'GETTING_STARTED_STEP_';
export const GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY =
  'GETTING_STARTED_SELECTED_STEP';
export const GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY =
  'GETTING_STARTED_SNOOZED_UNTIL';
export const GETTING_STARTED_HIDDEN_USER_VAR_KEY = 'GETTING_STARTED_HIDDEN';
export const GETTING_STARTED_HANDOVER_WORKFLOW_USER_VAR_KEY =
  'GETTING_STARTED_WORKFLOW_HANDOVER_DEALS';

export type GettingStartedKeyValueTypeMap = {
  [
    Key in `${typeof GETTING_STARTED_STEP_USER_VAR_KEY_PREFIX}${GettingStartedStep}`
  ]: { completedAt: string };
} & {
  [GETTING_STARTED_HANDOVER_WORKFLOW_USER_VAR_KEY]: GettingStartedWorkflowDTO;
  [GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY]: GettingStartedStep;
  [GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY]: string | null;
  [GETTING_STARTED_HIDDEN_USER_VAR_KEY]: boolean;
};
