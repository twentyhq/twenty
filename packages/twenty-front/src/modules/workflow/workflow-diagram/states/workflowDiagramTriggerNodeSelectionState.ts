import { createState } from 'twenty-ui/utilities';
export const workflowDiagramTriggerNodeSelectionState = createState<
  string | undefined
>({
  key: 'workflowDiagramTriggerNodeSelectionState',
  defaultValue: undefined,
});
