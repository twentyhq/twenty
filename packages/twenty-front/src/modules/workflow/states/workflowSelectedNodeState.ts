import { createState } from 'twenty-ui';

export const workflowSelectedNodeState = createState<string | undefined>({
  key: 'workflowSelectedNodeState',
  defaultValue: undefined,
});
