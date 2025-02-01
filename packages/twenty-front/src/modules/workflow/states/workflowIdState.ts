import { createState } from "twenty-shared";

export const workflowIdState = createState<string | undefined>({
  key: 'workflowIdState',
  defaultValue: undefined,
});
