import { createState } from 'twenty-ui/utilities';
export const workflowSelectedNodeState = createState<string | undefined>({
  key: 'workflowSelectedNodeState',
  defaultValue: undefined,
});
