import { GETTING_STARTED_COMPLETED_USER_VAR_KEY_PREFIX } from 'src/engine/core-modules/getting-started/constants/getting-started-completed-user-var-key-prefix.constant';
import { GETTING_STARTED_HANDOVER_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-user-var-key.constant';
import { GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-selected-step-user-var-key.constant';
import { GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY } from 'src/engine/core-modules/getting-started/constants/getting-started-snoozed-until-user-var-key.constant';
import { type GettingStartedHandoverDTO } from 'src/engine/core-modules/getting-started/dtos/getting-started-handover.dto';
import { type GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';

export type GettingStartedKeyValueTypeMap = {
  [
    Key in `${typeof GETTING_STARTED_COMPLETED_USER_VAR_KEY_PREFIX}.${GettingStartedStep}`
  ]: boolean;
} & {
  [GETTING_STARTED_SELECTED_STEP_USER_VAR_KEY]: GettingStartedStep;
  [GETTING_STARTED_SNOOZED_UNTIL_USER_VAR_KEY]: string | null;
  [GETTING_STARTED_HANDOVER_USER_VAR_KEY]: GettingStartedHandoverDTO;
};
