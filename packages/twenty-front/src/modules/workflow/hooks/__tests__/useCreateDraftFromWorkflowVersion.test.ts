import { act, renderHook } from '@testing-library/react';
import { useCreateDraftFromWorkflowVersion } from '@/workflow/hooks/useCreateDraftFromWorkflowVersion';

const mockCoreMutation = jest.fn();
const mockInvalidate = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));
jest.mock(
  '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions',
  () => ({ invalidateCoreWorkflowVersions: () => mockInvalidate() }),
);
jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockCoreMutation],
}));

describe('draft creation ID boundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCoreMutation.mockResolvedValue({
      data: { createDraftFromWorkflowVersion: { id: 'returned-core-draft' } },
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
    expect(mockInvalidate).toHaveBeenCalledTimes(1);
  });

  it('propagates core errors', async () => {
    mockCoreMutation.mockRejectedValueOnce(new Error('Core unavailable'));
    const { result } = renderHook(() => useCreateDraftFromWorkflowVersion());
    await expect(
      result.current.createDraftFromWorkflowVersion({
        workflowId: 'core-workflow',
        workflowVersionIdToCopy: 'core-published-version',
      }),
    ).rejects.toThrow('Core unavailable');
  });
});
