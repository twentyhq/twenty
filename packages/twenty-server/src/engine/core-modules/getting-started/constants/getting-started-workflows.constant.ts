import { GETTING_STARTED_HANDOVER_WORKFLOW } from 'src/engine/core-modules/getting-started/constants/getting-started-handover-workflow.constant';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedWorkflow } from 'src/engine/core-modules/getting-started/types/getting-started-workflow.type';

export const GETTING_STARTED_WORKFLOWS: Partial<
  Record<GettingStartedStep, GettingStartedWorkflow>
> = {
  [GettingStartedStep.HANDOVER_DEALS]: GETTING_STARTED_HANDOVER_WORKFLOW,
};
