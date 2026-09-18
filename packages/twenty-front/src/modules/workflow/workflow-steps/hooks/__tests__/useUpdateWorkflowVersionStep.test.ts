import { createStore, Provider } from 'jotai';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowDiagramComponentState } from '@/workflow/workflow-diagram/states/workflowDiagramComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { act, renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';

const mockMutate = jest.fn();
let mockOnCoreError: (error: Error) => void;
const jotaiStore = createStore();
let mockIsCore = false;
const mockInvalidate = jest.fn();
jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => mockIsCore,
}));
jest.mock(
  '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions',
  () => ({
    invalidateCoreWorkflowVersions: (...args: unknown[]) =>
      mockInvalidate(...args),
  }),
);
const mockGetRecordFromCache = jest.fn();
const mockMarkStepForRecomputation = jest.fn();

jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ cache: {} }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({ objectMetadataItem: {} }),
}));

jest.mock('@/object-record/hooks/useObjectPermissions', () => ({
  useObjectPermissions: () => ({ objectPermissionsByObjectMetadataId: {} }),
}));

const mockEnqueueToast = jest.fn();

jest.mock('twenty-ui/primitives/feedback', () => ({
  ...jest.requireActual('twenty-ui/primitives/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

jest.mock('@/object-record/cache/hooks/useGetRecordFromCache', () => ({
  useGetRecordFromCache: () => mockGetRecordFromCache,
}));

jest.mock('@/object-record/cache/utils/updateRecordFromCache', () => ({
  updateRecordFromCache: jest.fn(),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    markStepForRecomputation: mockMarkStepForRecomputation,
  }),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: (
    _document: unknown,
    options: { onError?: (error: Error) => void },
  ) => {
    if (options.onError) mockOnCoreError = options.onError;
    return [mockMutate];
  },
}));

const Wrapper = ({ children }: { children: ReactNode }) =>
  createElement(
    Provider,
    { store: jotaiStore },
    createElement(
      WorkflowVisualizerComponentInstanceContext.Provider,
      { value: { instanceId: 'workflow-visualizer-test' } },
      children,
    ),
  );

describe('useUpdateWorkflowVersionStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsCore = false;
    jotaiStore.set(
      flowComponentState.atomFamily({ instanceId: 'workflow-visualizer-test' }),
      undefined,
    );
  });

  it('should mark step for recomputation after successful update', async () => {
    const updatedStep = {
      id: 'step-1',
      name: 'My Custom Name',
      type: 'CREATE_RECORD',
    };

    mockMutate.mockResolvedValue({
      data: { updateWorkflowVersionStep: updatedStep },
    });

    mockGetRecordFromCache.mockReturnValue({
      id: 'version-1',
      steps: [{ id: 'step-1', name: 'Create Record', type: 'CREATE_RECORD' }],
    });

    const { result } = renderHook(() => useUpdateWorkflowVersionStep(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: updatedStep,
      });
    });

    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: 'version-1',
    });
  });

  it('should not mark step for recomputation when mutation returns no data', async () => {
    mockMutate.mockResolvedValue({ data: null });

    const { result } = renderHook(() => useUpdateWorkflowVersionStep(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: { id: 'step-1', name: 'Step', type: 'CODE' },
      });
    });

    expect(mockMarkStepForRecomputation).not.toHaveBeenCalled();
  });

  it('should still mark step for recomputation when cached record is missing', async () => {
    mockMutate.mockResolvedValue({
      data: {
        updateWorkflowVersionStep: {
          id: 'step-1',
          name: 'Step',
          type: 'CODE',
        },
      },
    });

    mockGetRecordFromCache.mockReturnValue(undefined);

    const { result } = renderHook(() => useUpdateWorkflowVersionStep(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.updateWorkflowVersionStep({
        workflowVersionId: 'version-1',
        step: { id: 'step-1', name: 'Step', type: 'CODE' },
      });
    });

    expect(mockMarkStepForRecomputation).toHaveBeenCalledWith({
      stepId: 'step-1',
      workflowVersionId: 'version-1',
    });
  });
  it('sends a core version ID and preserves business record IDs in step input', async () => {
    mockIsCore = true;
    const step = {
      id: 'step-1',
      type: 'UPDATE_RECORD',
      settings: { input: { objectRecordId: 'business-record-id' } },
    };
    mockMutate.mockResolvedValue({ data: { updateWorkflowVersionStep: step } });
    const { result } = renderHook(() => useUpdateWorkflowVersionStep(), {
      wrapper: Wrapper,
    });
    await act(() =>
      result.current.updateWorkflowVersionStep({
        workflowVersionId: 'core-draft-id',
        step,
      }),
    );
    expect(mockMutate).toHaveBeenCalledWith({
      variables: { input: { coreWorkflowVersionId: 'core-draft-id', step } },
    });
    expect(mockGetRecordFromCache).not.toHaveBeenCalled();
    expect(mockInvalidate).toHaveBeenCalled();
  });
  it('reports a failed core edit and removes unpersisted diagram changes', async () => {
    mockIsCore = true;
    const error = new Error('Core save failed');
    const instance = { instanceId: 'workflow-visualizer-test' };
    jotaiStore.set(flowComponentState.atomFamily(instance), {
      workflowVersionId: 'core-draft-id',
      trigger: null,
      steps: [],
    });
    jotaiStore.set(workflowDiagramComponentState.atomFamily(instance), {
      nodes: [],
      edges: [
        {
          id: 'unsaved',
          source: 'source',
          target: 'target',
          sourceHandle: 'source',
          targetHandle: 'target',
        },
      ],
    });
    mockMutate.mockImplementationOnce(async () => {
      mockOnCoreError(error);
      return { data: null };
    });
    const { result } = renderHook(() => useUpdateWorkflowVersionStep(), {
      wrapper: Wrapper,
    });
    await act(() =>
      result.current.updateWorkflowVersionStep({
        workflowVersionId: 'core-draft-id',
        step: { id: 'step-1', type: 'CODE' },
      }),
    );
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children: 'Core save failed',
      }),
    );
    expect(
      jotaiStore.get(workflowDiagramComponentState.atomFamily(instance))?.edges,
    ).toEqual([]);
    expect(mockMarkStepForRecomputation).not.toHaveBeenCalled();
  });
});
