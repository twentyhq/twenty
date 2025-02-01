import { createState } from "twenty-shared";

export const workflowVersionIdState = createState<string | undefined>({
  key: 'workflowVersionIdState',
  defaultValue: undefined,
});
