import { act, renderHook, waitFor } from '@testing-library/react';
import { atom, createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { shouldWorkflowRefetchRequestFamilyState } from '@/workflow/states/shouldWorkflowRefetchRequestFamilyState';
import { workflowVisualizerWorkflowIdComponentState } from '@/workflow/states/workflowVisualizerWorkflowIdComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { WorkflowDiagramEffect } from '@/workflow/workflow-diagram/components/WorkflowDiagramEffect';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { useApplyWorkflowVersionStepChanges } from '@/workflow/workflow-steps/hooks/useApplyWorkflowVersionStepChanges';
import { type WorkflowVersionContent } from '@/workflow/workflow-version/hooks/useWorkflowVersionContent';

const WORKFLOW_ID = 'workflow-id';
const DRAFT_VERSION_ID = 'draft-version-id';

const existingStep = {
  id: 'existing-step',
  name: 'Delay',
  type: 'DELAY',
  valid: true,
  settings: {},
  nextStepIds: [],
} as unknown as WorkflowAction;

const addedStep = {
  ...existingStep,
  id: 'added-step',
} as WorkflowAction;

const buildContent = (steps: WorkflowAction[]): WorkflowVersionContent => ({
  workflowVersionId: DRAFT_VERSION_ID,
  trigger: null,
  steps,
});

const mockContentAtom = atom<WorkflowVersionContent>(
  buildContent([existingStep]),
);
const mockRefetchContent = jest.fn();

jest.mock(
  '@/workflow/workflow-version/hooks/useWorkflowVersionContent',
  () => ({
    useWorkflowVersionContent: () => ({
      content: jest.requireActual('jotai').useAtomValue(mockContentAtom),
      refetchContent: mockRefetchContent,
      contentUpdatedAt: undefined,
    }),
  }),
);

jest.mock('@/workflow/hooks/useWorkflowWithCurrentVersion', () => ({
  useWorkflowWithCurrentVersion: () => ({
    id: 'workflow-id',
    currentVersion: { id: 'draft-version-id', status: 'DRAFT' },
  }),
}));

jest.mock('@/workflow/hooks/useSavePendingWorkflowFlow', () => ({
  useSavePendingWorkflowFlow: () => ({
    savePendingWorkflowFlow: () => Promise.resolve({ isSaved: true }),
  }),
}));

jest.mock('@/workflow/workflow-variables/hooks/useStepsOutputSchema', () => ({
  useStepsOutputSchema: () => ({
    populateStepsOutputSchema: jest.fn(),
    deleteStepsOutputSchema: jest.fn(),
  }),
}));

const createDeferred = () => {
  let resolve: () => void = () => {};
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
};

const renderWorkflowDiagramEffect = () => {
  const store = createStore();

  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkflowVisualizerComponentInstanceContext.Provider
        value={{ instanceId: WORKFLOW_ID }}
      >
        <WorkflowDiagramEffect />
        {children}
      </WorkflowVisualizerComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  const { result } = renderHook(
    () => ({
      flow: useAtomComponentStateValue(flowComponentState),
      setWorkflowId: useSetAtomComponentState(
        workflowVisualizerWorkflowIdComponentState,
      ),
      requestRefetch: useSetAtomFamilyState(
        shouldWorkflowRefetchRequestFamilyState,
        WORKFLOW_ID,
      ),
      ...useApplyWorkflowVersionStepChanges(),
    }),
    { wrapper },
  );

  return { result, store };
};

const getFlowStepIds = (flow: { steps: WorkflowAction[] | null } | undefined) =>
  flow?.steps?.map((step) => step.id);

describe('WorkflowDiagramEffect', () => {
  beforeEach(() => {
    mockRefetchContent.mockReset();
  });

  it('keeps a step added while a refetch triggered by a workflow event is in flight', async () => {
    const { result, store } = renderWorkflowDiagramEffect();

    act(() => {
      result.current.setWorkflowId(WORKFLOW_ID);
    });

    await waitFor(() => {
      expect(getFlowStepIds(result.current.flow)).toEqual(['existing-step']);
    });

    // The draft creation event refetches the draft before the first step lands on the server
    const staleRefetch = createDeferred();
    mockRefetchContent.mockReturnValueOnce(staleRefetch.promise);

    act(() => {
      result.current.requestRefetch(true);
    });

    await waitFor(() => {
      expect(mockRefetchContent).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.applyWorkflowVersionStepChanges({
        workflowVersionId: DRAFT_VERSION_ID,
        workflowVersionStepChanges: {
          triggerDiff: [],
          stepsDiff: [{ type: 'CREATE', path: ['steps', 1], value: addedStep }],
        },
      });
    });

    const freshRefetch = createDeferred();
    mockRefetchContent.mockReturnValueOnce(freshRefetch.promise);

    await act(async () => {
      staleRefetch.resolve();
      await staleRefetch.promise;
    });

    expect(getFlowStepIds(result.current.flow)).toEqual([
      'existing-step',
      'added-step',
    ]);

    await waitFor(() => {
      expect(mockRefetchContent).toHaveBeenCalledTimes(2);
    });

    await act(async () => {
      store.set(mockContentAtom, buildContent([existingStep, addedStep]));
      freshRefetch.resolve();
      await freshRefetch.promise;
    });

    expect(getFlowStepIds(result.current.flow)).toEqual([
      'existing-step',
      'added-step',
    ]);
    expect(mockRefetchContent).toHaveBeenCalledTimes(2);
  });

  it('seeds the flow from the refetched content when nothing changed locally meanwhile', async () => {
    const { result, store } = renderWorkflowDiagramEffect();

    act(() => {
      result.current.setWorkflowId(WORKFLOW_ID);
    });

    await waitFor(() => {
      expect(getFlowStepIds(result.current.flow)).toEqual(['existing-step']);
    });

    mockRefetchContent.mockImplementationOnce(async () => {
      store.set(mockContentAtom, buildContent([existingStep, addedStep]));
    });

    act(() => {
      result.current.requestRefetch(true);
    });

    await waitFor(() => {
      expect(getFlowStepIds(result.current.flow)).toEqual([
        'existing-step',
        'added-step',
      ]);
    });
    expect(mockRefetchContent).toHaveBeenCalledTimes(1);
  });
});
