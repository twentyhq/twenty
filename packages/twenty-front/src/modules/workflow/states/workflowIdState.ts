import { createState } from 'twenty-ui';

export const workflowIdState = createState<string | undefined>({
  key: 'workflowIdState',
  defaultValue: undefined,
});
