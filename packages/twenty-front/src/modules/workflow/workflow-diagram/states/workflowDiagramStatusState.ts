import { createState } from 'twenty-ui/utilities';

export const workflowDiagramStatusState = createState<
  'computing-diagram' | 'computing-dimensions' | 'done'
>({
  key: 'workflowDiagramStatusState',
  defaultValue: 'computing-diagram',
});
