import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowFlowSaveInProgressComponentState } from '@/workflow/states/workflowFlowSaveInProgressComponentState';
import { useUpdateWorkflowVersionPositions } from '@/workflow/workflow-version/hooks/useUpdateWorkflowVersionPositions';

const INSTANCE_ID = 'workflow-visualizer-workflow-1';

const mockMutate = jest.fn().mockResolvedValue({});

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useMutation: () => [mockMutate],
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({}),
}));
jest.mock(
  '@/object-core/workflows/versions/utils/invalidateCoreWorkflowVersions',
  () => ({ invalidateCoreWorkflowVersions: jest.fn() }),
);
jest.mock('@/workflow/hooks/useSavePendingWorkflowFlow', () => ({
  useSavePendingWorkflowFlow: () => ({
    savePendingWorkflowFlow: jest.fn().mockResolvedValue({ isSaved: true }),
  }),
}));
jest.mock('@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow', () => ({
  useGetUpdatableWorkflowVersionOrThrow: () => ({
    getUpdatableWorkflowVersion: jest.fn().mockResolvedValue('version'),
  }),
}));

describe('useUpdateWorkflowVersionPositions', () => {
  it('waits for a save already in progress before saving positions', async () => {
    const store = createStore();
    const saveInProgressAtom =
      workflowFlowSaveInProgressComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      });
    let finishStepSave: () => void = () => undefined;

    store.set(flowComponentState.atomFamily({ instanceId: INSTANCE_ID }), {
      workflowVersionId: 'version',
      trigger: null,
      steps: [],
    });
    store.set(saveInProgressAtom, {
      flowKeys: ['step'],
      promise: new Promise<void>((resolve) => {
        finishStepSave = resolve;
      }),
    });

    const { result } = renderHook(
      () => useUpdateWorkflowVersionPositions(INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <JotaiProvider store={store}>{children}</JotaiProvider>
        ),
      },
    );

    let positionsSave: Promise<void> = Promise.resolve();

    await act(async () => {
      positionsSave = result.current.updateWorkflowVersionPositions([
        { id: 'trigger', position: { x: 1, y: 2 } },
      ]);
    });

    expect(mockMutate).not.toHaveBeenCalled();

    await act(async () => {
      store.set(saveInProgressAtom, undefined);
      finishStepSave();
      await positionsSave;
    });

    expect(mockMutate).toHaveBeenCalledTimes(1);
    expect(store.get(saveInProgressAtom)).toBeUndefined();
  });
});
