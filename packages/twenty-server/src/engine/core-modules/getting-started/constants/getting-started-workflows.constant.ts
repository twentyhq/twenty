import { GETTING_STARTED_HANDOVER_WORKFLOW } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-workflow.constant';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';

export const GETTING_STARTED_WORKFLOWS: Partial<
  Record<GettingStartedStepActionKey, GettingStartedWorkflow>
> = {
  [GettingStartedStepActionKey.HANDOVER_DEALS]:
    GETTING_STARTED_HANDOVER_WORKFLOW,
};
