import { createState } from 'twenty-ui/utilities';
export const workflowIdState = createState<string | undefined>({
  key: 'workflowIdState',
  defaultValue: undefined,
});
