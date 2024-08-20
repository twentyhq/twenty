import { FlowData } from '@/workflow/types/Workflow';
import { createState } from 'twenty-ui';

export const currentWorkflowDataState = createState<FlowData | undefined>({
  key: 'currentWorkflowDataState',
  defaultValue: undefined,
});
