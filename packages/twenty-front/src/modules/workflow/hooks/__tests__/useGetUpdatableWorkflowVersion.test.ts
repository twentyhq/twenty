import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { type WorkflowWithCurrentVersion } from '@/workflow/types/Workflow';
import { renderHook } from '@testing-library/react';

const mockCreateDraftFromWorkflowVersion = jest.fn().mockResolvedValue('457');
const mockWorkflowId = '123';
const mockWorkflow = {
  id: mockWorkflowId,
  currentVersion: {
    id: '456',
    status: 'DRAFT',
  },
} as WorkflowWithCurrentVersion;

jest.mock('@/workflow/hooks/useCreateDraftFromWorkflowVersion', () => ({
  useCreateDraftFromWorkflowVersion: () => ({
    createDraftFromWorkflowVersion: mockCreateDraftFromWorkflowVersion,
  }),
}));

jest.mock(
  '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue',
  () => ({
    useRecoilComponentValue: jest.fn(() => mockWorkflowId),
  }),
);

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: jest.fn((workflowId) =>
    workflowId === mockWorkflowId ? mockWorkflow : undefined,
  ),
}));

describe('useGetUpdatableWorkflowVersionOrThrow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return draft version id when current version is draft', async () => {
    const { result } = renderHook(() =>
      useGetUpdatableWorkflowVersionOrThrow(),
    );
    const workflowVersionId =
      await result.current.getUpdatableWorkflowVersion();

    expect(mockCreateDraftFromWorkflowVersion).not.toHaveBeenCalled();
    expect(workflowVersionId).toEqual('456');
  });

  it('should create draft from active version when current version is active', async () => {
    // Mock the workflow to have an active version
    const mockActiveWorkflow = {
      ...mockWorkflow,
      currentVersion: {
        ...mockWorkflow.currentVersion,
        status: 'ACTIVE',
      },
    } as WorkflowWithCurrentVersion;

    const {
      useWorkflowWithCurrentVersion,
    } = require('@/workflow/hooks/useWorkflowWithCurrentVersion');
    useWorkflowWithCurrentVersion.mockReturnValue(mockActiveWorkflow);

    const { result } = renderHook(() =>
      useGetUpdatableWorkflowVersionOrThrow(),
    );
    const workflowVersionId =
      await result.current.getUpdatableWorkflowVersion();

    expect(mockCreateDraftFromWorkflowVersion).toHaveBeenCalledWith({
      workflowId: mockWorkflowId,
      workflowVersionIdToCopy: '456',
    });
    expect(workflowVersionId).toEqual('457');
  });

  it('should throw an error when workflow is not found', async () => {
    const {
      useWorkflowWithCurrentVersion,
    } = require('@/workflow/hooks/useWorkflowWithCurrentVersion');
    useWorkflowWithCurrentVersion.mockReturnValue(undefined);

    const { result } = renderHook(() =>
      useGetUpdatableWorkflowVersionOrThrow(),
    );

    await expect(result.current.getUpdatableWorkflowVersion()).rejects.toThrow(
      'Failed to get updatable workflow version',
    );
  });
});
