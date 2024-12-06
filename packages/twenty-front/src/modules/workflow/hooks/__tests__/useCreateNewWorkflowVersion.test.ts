import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { WorkflowVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';
import { useCreateNewWorkflowVersion } from '../useCreateNewWorkflowVersion';

jest.mock('@/object-record/hooks/useCreateOneRecord', () => ({
  useCreateOneRecord: jest.fn(),
}));

describe('useCreateNewWorkflowVersion', () => {
  it('should create workflow version', async () => {
    const mockCreateOneRecord = jest.fn();
    (useCreateOneRecord as jest.Mock).mockImplementation(() => ({
      createOneRecord: mockCreateOneRecord,
    }));

    const workflowVersionData = {
      workflowId: '123',
      name: 'Test Version',
      status: 'draft',
      trigger: { type: 'manual' },
      steps: [],
    };

    const { result } = renderHook(() => useCreateNewWorkflowVersion());
    await result.current.createNewWorkflowVersion(
      workflowVersionData as unknown as WorkflowVersion,
    );

    expect(useCreateOneRecord).toHaveBeenCalledWith({
      objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    });
    expect(mockCreateOneRecord).toHaveBeenCalledWith(workflowVersionData);
  });
});
