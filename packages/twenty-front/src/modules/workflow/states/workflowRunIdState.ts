import { createState } from '@ui/utilities/state/utils/createState';

export const workflowRunIdState = createState<string | undefined>({
  key: 'workflowRunIdState',
  defaultValue: undefined,
});
