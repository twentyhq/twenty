import { createState } from 'twenty-ui';

export const currentWorkflowErrorState = createState<Error | undefined>({
  key: 'currentWorkflowErrorState',
  defaultValue: undefined,
});
