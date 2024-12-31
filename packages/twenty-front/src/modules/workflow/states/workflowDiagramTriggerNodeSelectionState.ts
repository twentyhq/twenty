import { createState } from '@ui/utilities/state/utils/createState';

export const workflowDiagramTriggerNodeSelectionState = createState<
  string | undefined
>({
  key: 'workflowDiagramTriggerNodeSelectionState',
  defaultValue: undefined,
});
