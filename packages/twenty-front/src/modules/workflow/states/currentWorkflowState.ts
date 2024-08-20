import { FlowData } from '@/workflow/types/Workflow';
import { createState } from 'twenty-ui';

export const currentWorkflowState = createState<{
  data: FlowData | undefined;
  loading: boolean;
  error: Error | undefined;
}>({
  key: 'currentWorkflowState',
  defaultValue: {
    data: undefined,
    error: undefined,
    loading: true,
  },
});
