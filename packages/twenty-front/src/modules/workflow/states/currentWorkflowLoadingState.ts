import { createState } from 'twenty-ui';

export const currentWorkflowLoadingState = createState<boolean>({
  key: 'currentWorkflowLoadingState',
  defaultValue: true,
});
