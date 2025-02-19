import { createState } from '@ui/utilities/state/utils/createState';

export const workflowVersionIdState = createState<string | undefined>({
  key: 'workflowVersionIdState',
  defaultValue: undefined,
});
