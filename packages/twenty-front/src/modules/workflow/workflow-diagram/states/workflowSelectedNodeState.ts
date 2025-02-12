import { createState } from '@ui/utilities/state/utils/createState';

export const workflowSelectedNodeState = createState<string | undefined>({
  key: 'workflowSelectedNodeState',
  defaultValue: undefined,
});
