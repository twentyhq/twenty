import { createState } from 'twenty-ui';

export const workflowCreateStepFromParentStepIdState = createState<
  string | undefined
>({
  key: 'workflowCreateStepFromParentStepId',
  defaultValue: undefined,
});
