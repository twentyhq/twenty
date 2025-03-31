import { createState } from "twenty-ui";

export const workflowRunIdState = createState<string | undefined>({
  key: 'workflowRunIdState',
  defaultValue: undefined,
});
