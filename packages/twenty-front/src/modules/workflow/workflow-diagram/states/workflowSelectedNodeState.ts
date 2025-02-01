import { createState } from "twenty-shared";

export const workflowSelectedNodeState = createState<string | undefined>({
  key: 'workflowSelectedNodeState',
  defaultValue: undefined,
});
