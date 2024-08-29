import { createState } from 'twenty-ui';

export const workflowCreateStepFropParentStepIdState = createState<
  string | undefined
>({
  key: 'workflowCreateStepFropParentStepId',
  defaultValue: undefined,
});
