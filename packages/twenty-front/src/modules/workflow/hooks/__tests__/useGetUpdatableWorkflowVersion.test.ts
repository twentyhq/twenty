import { renderHook } from '@testing-library/react';
import { useGetUpdatableWorkflowVersion } from '@/workflow/hooks/useGetUpdatableWorkflowVersion';
import { WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';

const mockCreateNewWorkflowVersion = jest.fn().mockResolvedValue({
  id: '457',
  name: 'toto',
  createdAt: '2024-07-03T20:03:35.064Z',
  updatedAt: '2024-07-03T20:03:35.064Z',
  workflowId: '123',
  __typename: 'WorkflowVersion',
  status: 'DRAFT',
  steps: [],
  trigger: null,
});

jest.mock('@/workflow/hooks/useCreateNewWorkflowVersion', () => ({
  useCreateNewWorkflowVersion: () => ({
    createNewWorkflowVersion: mockCreateNewWorkflowVersion,
  }),
}));

describe('useGetUpdatableWorkflowVersion', () => {
  const mockWorkflow = (status: 'ACTIVE' | 'DRAFT') =>
    ({
      id: '123',
      __typename: 'Workflow',
      statuses: [],
      lastPublishedVersionId: '1',
      name: 'toto',
      versions: [],
      currentVersion: {
        id: '456',
        name: 'toto',
        createdAt: '2024-07-03T20:03:35.064Z',
        updatedAt: '2024-07-03T20:03:35.064Z',
        workflowId: '123',
        __typename: 'WorkflowVersion',
        status,
        steps: [],
        trigger: null,
      },
    }) as WorkflowWithCurrentVersion;

  it('should not create workflow version if draft version exists', async () => {
    const { result } = renderHook(() => useGetUpdatableWorkflowVersion());
    const workflowVersion = await result.current.getUpdatableWorkflowVersion(
      mockWorkflow('DRAFT'),
    );
    expect(mockCreateNewWorkflowVersion).not.toHaveBeenCalled();
    expect(workflowVersion.id === '456');
  });

  it('should create workflow version if no draft version exists', async () => {
    const { result } = renderHook(() => useGetUpdatableWorkflowVersion());
    const workflowVersion = await result.current.getUpdatableWorkflowVersion(
      mockWorkflow('ACTIVE'),
    );
    expect(mockCreateNewWorkflowVersion).toHaveBeenCalled();
    expect(workflowVersion.id === '457');
  });
});
