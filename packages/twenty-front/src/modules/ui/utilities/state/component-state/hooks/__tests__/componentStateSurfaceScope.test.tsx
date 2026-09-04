import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const TAB_LIST_ID = 'http-request-tabs';
const WORKFLOW_INSTANCE_ID = 'workflow-visualizer-42';
const SIDE_PANEL_INSTANCE_ID = 'side-panel-page-7c3f';

const buildWrapper =
  (
    store: ReturnType<typeof createStore>,
    surface: 'main' | 'side-panel',
    surfaceInstanceId = SIDE_PANEL_INSTANCE_ID,
  ) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <WorkspaceSurfaceContext.Provider
        value={{
          type: surface,
          instanceId:
            surface === 'main'
              ? MAIN_CONTEXT_STORE_INSTANCE_ID
              : surfaceInstanceId,
          ownsRouteLocation: false,
        }}
      >
        {children}
      </WorkspaceSurfaceContext.Provider>
    </JotaiProvider>
  );

describe('component state surface scope', () => {
  describe("a 'per-surface' state", () => {
    it('is shared by everything on one surface that names the same instance id', () => {
      const store = createStore();
      const wrapper = buildWrapper(store, 'side-panel');

      const { result: writer } = renderHook(
        () => useAtomComponentState(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper },
      );

      act(() => {
        writer.current[1]('test');
      });

      // the regression from #25318: the tab content renders as a sibling of the
      // tab list, so it reads this state with the same id, from outside the
      // provider the tab list creates
      const { result: sibling } = renderHook(
        () =>
          useAtomComponentStateValue(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper },
      );

      expect(sibling.current).toBe('test');
    });

    it('keeps two surfaces apart under the same instance id', () => {
      const store = createStore();

      const { result: sidePanel } = renderHook(
        () => useAtomComponentState(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper: buildWrapper(store, 'side-panel') },
      );

      act(() => {
        sidePanel.current[1]('test');
      });

      const { result: main } = renderHook(
        () =>
          useAtomComponentStateValue(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper: buildWrapper(store, 'main') },
      );

      expect(main.current).toBeNull();
    });

    it('keeps two side panel pages apart under the same instance id', () => {
      const store = createStore();

      const { result: firstPage } = renderHook(
        () => useAtomComponentState(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper: buildWrapper(store, 'side-panel', 'page-one') },
      );

      act(() => {
        firstPage.current[1]('test');
      });

      const { result: secondPage } = renderHook(
        () =>
          useAtomComponentStateValue(activeTabIdComponentState, TAB_LIST_ID),
        { wrapper: buildWrapper(store, 'side-panel', 'page-two') },
      );

      expect(secondPage.current).toBeNull();
    });

    // navigation helpers seed a side panel page's state before that page exists,
    // from whatever surface the click happened on. The surface in the key has to
    // be the destination page, not theirs.
    it('is seeded for a page that has not rendered yet by naming that page as the surface', () => {
      const store = createStore();
      const destinationPageId = 'page-about-to-open';

      store.set(
        activeTabIdComponentState.atomFamily({
          instanceId: TAB_LIST_ID,
          surfaceId: destinationPageId,
        }),
        'test',
      );

      const { result: onDestinationPage } = renderHook(
        () =>
          useAtomComponentStateValue(activeTabIdComponentState, TAB_LIST_ID),
        {
          wrapper: buildWrapper(store, 'side-panel', destinationPageId),
        },
      );

      expect(onDestinationPage.current).toBe('test');
    });
  });

  describe("a 'shared' state", () => {
    // the regression from #25164: the side panel step editor provides the main
    // diagram's instance id on purpose, to read the flow the diagram wrote
    it('crosses surfaces under the same instance id', () => {
      const store = createStore();

      const { result: mainSurface } = renderHook(
        () => useAtomComponentState(flowComponentState, WORKFLOW_INSTANCE_ID),
        { wrapper: buildWrapper(store, 'main') },
      );

      act(() => {
        mainSurface.current[1]({
          workflowVersionId: 'version-1',
          trigger: null,
          steps: null,
        });
      });

      const { result: sidePanel } = renderHook(
        () =>
          useAtomComponentStateValue(flowComponentState, WORKFLOW_INSTANCE_ID),
        { wrapper: buildWrapper(store, 'side-panel') },
      );

      expect(sidePanel.current).toEqual({
        workflowVersionId: 'version-1',
        trigger: null,
        steps: null,
      });
    });
  });
});
