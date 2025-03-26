import { createState } from 'twenty-ui';

export const workflowDiagramTriggerNodeSelectionState = createState<
  string | undefined
>({
  key: 'workflowDiagramTriggerNodeSelectionState',
  defaultValue: undefined,
});
