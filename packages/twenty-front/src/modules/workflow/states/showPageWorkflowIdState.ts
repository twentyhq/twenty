import { createState } from 'twenty-ui';

export const showPageWorkflowIdState = createState<string | undefined>({
  key: 'showPageWorkflowIdState',
  defaultValue: undefined,
});
