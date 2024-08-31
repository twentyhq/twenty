import { createState } from 'twenty-ui';

export const showPageWorkflowSelectedNodeState = createState<
  string | undefined
>({
  key: 'showPageWorkflowSelectedNodeState',
  defaultValue: undefined,
});
