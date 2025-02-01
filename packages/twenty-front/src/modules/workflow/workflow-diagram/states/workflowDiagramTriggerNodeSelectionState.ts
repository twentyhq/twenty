import { createState } from "twenty-shared";

export const workflowDiagramTriggerNodeSelectionState = createState<
  string | undefined
>({
  key: 'workflowDiagramTriggerNodeSelectionState',
  defaultValue: undefined,
});
