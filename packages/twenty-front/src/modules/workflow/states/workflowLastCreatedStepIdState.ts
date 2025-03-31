import { createState } from "twenty-ui";

export const workflowLastCreatedStepIdState = createState<string | undefined>({
  key: 'workflowLastCreatedStepIdState',
  defaultValue: undefined,
});
