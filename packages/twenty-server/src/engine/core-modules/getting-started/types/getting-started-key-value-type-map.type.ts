import { type GettingStartedWorkflowDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-workflow.dto';
import { type GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';

export const GETTING_STARTED_STEP_ACTION_KEYS_USER_VAR_KEY =
  'GETTING_STARTED_STEP_ACTION_KEYS';
export const GETTING_STARTED_COMPLETED_STEP_USER_VAR_KEY_PREFIX =
  'GETTING_STARTED_COMPLETED_';
export const GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY =
  'GETTING_STARTED_SELECTED_STEP';
export const GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY =
  'GETTING_STARTED_SNOOZED_UNTIL';
export const GETTING_STARTED_HIDDEN_USER_VAR_KEY = 'GETTING_STARTED_HIDDEN';
export const GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX =
  'GETTING_STARTED_WORKFLOW_';

export type GettingStartedKeyValueTypeMap = {
  [
    Key in `${typeof GETTING_STARTED_COMPLETED_STEP_USER_VAR_KEY_PREFIX}${GettingStartedStepActionKey}`
  ]: { completedAt: string };
} & {
  [
    Key in `${typeof GETTING_STARTED_WORKFLOW_USER_VAR_KEY_PREFIX}${GettingStartedStepActionKey}`
  ]: GettingStartedWorkflowDTO;
} & {
  [GETTING_STARTED_STEP_ACTION_KEYS_USER_VAR_KEY]: string[];
  [GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY]: GettingStartedStepActionKey;
  [GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY]: string | null;
  [GETTING_STARTED_HIDDEN_USER_VAR_KEY]: boolean;
};
