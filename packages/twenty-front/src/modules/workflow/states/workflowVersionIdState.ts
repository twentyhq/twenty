import { createState } from 'twenty-ui';

export const workflowVersionIdState = createState<string | undefined>({
  key: 'workflowVersionIdState',
  defaultValue: undefined,
});
