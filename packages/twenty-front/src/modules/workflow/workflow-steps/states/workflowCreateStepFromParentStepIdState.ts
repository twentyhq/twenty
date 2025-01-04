import { createState } from '@ui/utilities/state/utils/createState';

export const workflowCreateStepFromParentStepIdState = createState<
  string | undefined
>({
  key: 'workflowCreateStepFromParentStepId',
  defaultValue: undefined,
});
