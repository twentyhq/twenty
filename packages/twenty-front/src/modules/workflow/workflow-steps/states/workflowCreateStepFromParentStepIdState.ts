import { createState } from 'twenty-ui/utilities';
export const workflowCreateStepFromParentStepIdState = createState<
  string | undefined
>({
  key: 'workflowCreateStepFromParentStepId',
  defaultValue: undefined,
});
