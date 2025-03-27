import { createState } from 'twenty-ui/utilities';
export const workflowRunIdState = createState<string | undefined>({
  key: 'workflowRunIdState',
  defaultValue: undefined,
});
