import { createState } from "twenty-shared";

export const workflowCreateStepFromParentStepIdState = createState<
  string | undefined
>({
  key: 'workflowCreateStepFromParentStepId',
  defaultValue: undefined,
});
