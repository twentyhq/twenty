import { useGetWorkflowNodeExecutionUsage } from '@/billing/hooks/useGetWorkflowNodeExecutionUsage';

describe('useGetWorkflowNodeExecutionUsage', () => {
  it('should be a function', () => {
    expect(typeof useGetWorkflowNodeExecutionUsage).toBe('function');
  });
});
