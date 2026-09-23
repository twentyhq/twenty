import { act, renderHook } from '@testing-library/react';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';
import { CreateDraftFromCoreWorkflowVersionDocument } from '~/generated/graphql';

const mockCoreMutation = jest.fn();
const mockWorkspaceMutation = jest.fn();
const mockInvalidate = jest.fn();
let mockIsCore = true;

jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => mockIsCore,
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));
jest.mock('@/object-record/hooks/useFindManyRecordsQuery', () => ({
  useFindManyRecordsQuery: () => ({ findManyRecordsQuery: {} }),
}));
jest.mock(
  '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions',
  () => ({ invalidateCoreWorkflowVersions: () => mockInvalidate() }),
);
jest.mock('@apollo/client/react', () => ({
  useMutation: (document: unknown) => [
    document === CreateDraftFromCoreWorkflowVersionDocument
      ? mockCoreMutation
      : mockWorkspaceMutation,
  ],
}));

describe('draft creation ID boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCore = true;
    mockCoreMutation.mockResolvedValue({
      data: { createDraftFromWorkflowVersion: { id: 'returned-core-draft' } },
    });
    mockWorkspaceMutation.mockResolvedValue({
      data: {
        createDraftFromWorkflowVersion: { id: 'returned-workspace-draft' },
      },
    });
  });

  it('returns the core draft ID for subsequent edits and refetches core definitions', async () => {
    const { result } = renderHook(() => useCreateDraftFromWorkflowVersion());
    let draftId: string | undefined;
    await act(async () => {
      draftId = await result.current.createDraftFromWorkflowVersion({
        workflowId: 'core-workflow',
        workflowVersionIdToCopy: 'core-published-version',
      });
    });
    expect(draftId).toBe('returned-core-draft');
    expect(mockCoreMutation).toHaveBeenCalledWith({
      variables: {
        input: {
          coreWorkflowId: 'core-workflow',
          coreWorkflowVersionIdToCopy: 'core-published-version',
        },
      },
    });
    expect(mockWorkspaceMutation).not.toHaveBeenCalled();
    expect(mockInvalidate).toHaveBeenCalledTimes(1);
  });

  it('preserves the workspace mutation and returned ID with the flag off', async () => {
    mockIsCore = false;
    const { result } = renderHook(() => useCreateDraftFromWorkflowVersion());
    const input = {
      workflowId: 'workspace-workflow',
      workflowVersionIdToCopy: 'workspace-published-version',
    };
    let draftId: string | undefined;
    await act(async () => {
      draftId = await result.current.createDraftFromWorkflowVersion(input);
    });
    expect(draftId).toBe('returned-workspace-draft');
    expect(mockWorkspaceMutation).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { input } }),
    );
    expect(mockCoreMutation).not.toHaveBeenCalled();
  });

  it('propagates core errors without invoking the workspace mutation', async () => {
    mockCoreMutation.mockRejectedValueOnce(new Error('Core unavailable'));
    const { result } = renderHook(() => useCreateDraftFromWorkflowVersion());
    await expect(
      result.current.createDraftFromWorkflowVersion({
        workflowId: 'core-workflow',
        workflowVersionIdToCopy: 'core-published-version',
      }),
    ).rejects.toThrow('Core unavailable');
    expect(mockWorkspaceMutation).not.toHaveBeenCalled();
  });
});
