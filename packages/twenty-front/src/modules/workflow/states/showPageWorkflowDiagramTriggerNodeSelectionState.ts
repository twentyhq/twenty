import { createState } from 'twenty-ui';

export const showPageWorkflowDiagramTriggerNodeSelectionState = createState<
  string | undefined
>({
  key: 'showPageWorkflowDiagramTriggerNodeSelectionState',
  defaultValue: undefined,
});
