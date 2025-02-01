import { createState } from "twenty-shared";

export const workflowLastCreatedStepIdState = createState<string | undefined>({
  key: 'workflowLastCreatedStepIdState',
  defaultValue: undefined,
});
