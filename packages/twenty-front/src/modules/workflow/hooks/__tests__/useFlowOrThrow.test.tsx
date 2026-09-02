import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useFlowOrThrow } from '@/workflow/hooks/useFlowOrThrow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

const VISUALIZER_INSTANCE_ID = 'workflow-visualizer-workflow-1';

const buildWrapper =
  ({
    store,
    surfaceType,
  }: {
    store: ReturnType<typeof createStore>;
    surfaceType: 'main' | 'side-panel';
  }) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: surfaceType,
          instanceId:
            surfaceType === 'side-panel'
              ? 'side-panel-page'
              : MAIN_CONTEXT_STORE_INSTANCE_ID,
          ownsRouteLocation: surfaceType === 'main',
        }}
      >
        <WorkflowVisualizerComponentInstanceContext.Provider
          value={{ instanceId: VISUALIZER_INSTANCE_ID }}
        >
          {children}
        </WorkflowVisualizerComponentInstanceContext.Provider>
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>
  );

describe('useFlowOrThrow', () => {
  // The workflow diagram on the main surface writes the flow, and the side
  // panel step editor deliberately provides the same visualizer instance id to
  // read it. If component ids were rewritten per surface, the side panel would
  // read a different atom and every step click would crash.
  it('reads a flow written on the main surface from a side panel sharing the instance id', () => {
    const store = createStore();
    const flow = {
      workflowVersionId: 'workflow-version-1',
      trigger: null,
      steps: [],
    };

    const { result: writer } = renderHook(
      () => useSetAtomComponentState(flowComponentState),
      { wrapper: buildWrapper({ store, surfaceType: 'main' }) },
    );

    act(() => {
      writer.current(flow);
    });

    const { result: reader } = renderHook(() => useFlowOrThrow(), {
      wrapper: buildWrapper({ store, surfaceType: 'side-panel' }),
    });

    expect(reader.current).toEqual(flow);
  });

  it('throws when the flow has not been written', () => {
    expect(() =>
      renderHook(() => useFlowOrThrow(), {
        wrapper: buildWrapper({
          store: createStore(),
          surfaceType: 'side-panel',
        }),
      }),
    ).toThrow('Expected the flow to be defined');
  });
});
