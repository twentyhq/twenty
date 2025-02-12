import { createState } from '@ui/utilities/state/utils/createState';

export const workflowIdState = createState<string | undefined>({
  key: 'workflowIdState',
  defaultValue: undefined,
});
