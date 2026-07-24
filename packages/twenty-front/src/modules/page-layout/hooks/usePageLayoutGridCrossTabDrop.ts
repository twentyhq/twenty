import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

import { PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE } from '@/page-layout/constants/PageLayoutTabDropTargetDataAttribute';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { pageLayoutCurrentLayoutsComponentState } from '@/page-layout/states/pageLayoutCurrentLayoutsComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutGridDragHoveredTabIdComponentState } from '@/page-layout/states/pageLayoutGridDragHoveredTabIdComponentState';
import { pageLayoutShouldIgnoreNextGridLayoutChangeComponentState } from '@/page-layout/states/pageLayoutShouldIgnoreNextGridLayoutChangeComponentState';
import { buildTabWidgetLayouts } from '@/page-layout/utils/buildTabWidgetLayouts';
import { moveWidgetToGridTabInDraft } from '@/page-layout/utils/moveWidgetToGridTabInDraft';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';

const findTabDropTargetIdAtPoint = (
  clientX: number,
  clientY: number,
): string | null => {
  const dropTargetElements = document.querySelectorAll<HTMLElement>(
    `[${PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE}]`,
  );

  for (const dropTargetElement of dropTargetElements) {
    const rect = dropTargetElement.getBoundingClientRect();

    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      return dropTargetElement.getAttribute(
        PAGE_LAYOUT_TAB_DROP_TARGET_DATA_ATTRIBUTE,
      );
    }
  }

  return null;
};

// Bridges react-grid-layout drags to the tab strip: grid drags never enter
// dnd-kit, so hovering and dropping on tab buttons is resolved by hit-testing
// the pointer against the tab drop targets.
export const usePageLayoutGridCrossTabDrop = ({ tabId }: { tabId: string }) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
  );

  const store = useStore();

  const pageLayoutDraftState = useAtomComponentStateCallbackState(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutCurrentLayoutsState = useAtomComponentStateCallbackState(
    pageLayoutCurrentLayoutsComponentState,
    pageLayoutId,
  );

  const gridDragHoveredTabIdState = useAtomComponentStateCallbackState(
    pageLayoutGridDragHoveredTabIdComponentState,
    pageLayoutId,
  );

  const shouldIgnoreNextGridLayoutChangeState =
    useAtomComponentStateCallbackState(
      pageLayoutShouldIgnoreNextGridLayoutChangeComponentState,
      pageLayoutId,
    );

  const findGridDropDestinationTabId = useCallback(
    (clientX: number, clientY: number): string | null => {
      const hoveredTabId = findTabDropTargetIdAtPoint(clientX, clientY);

      if (!isDefined(hoveredTabId) || hoveredTabId === tabId) {
        return null;
      }

      const draft = store.get(pageLayoutDraftState);
      const destinationTab = draft.tabs.find((tab) => tab.id === hoveredTabId);

      if (
        !isDefined(destinationTab) ||
        destinationTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
      ) {
        return null;
      }

      return hoveredTabId;
    },
    [store, pageLayoutDraftState, tabId],
  );

  const handleGridDrag = useCallback(
    (event: MouseEvent) => {
      const destinationTabId = findGridDropDestinationTabId(
        event.clientX,
        event.clientY,
      );

      if (store.get(gridDragHoveredTabIdState) !== destinationTabId) {
        store.set(gridDragHoveredTabIdState, destinationTabId);
      }
    },
    [store, gridDragHoveredTabIdState, findGridDropDestinationTabId],
  );

  const handleGridDragStop = useCallback(
    (widgetId: string, event: MouseEvent): boolean => {
      store.set(gridDragHoveredTabIdState, null);

      const destinationTabId = findGridDropDestinationTabId(
        event.clientX,
        event.clientY,
      );

      if (!isDefined(destinationTabId)) {
        return false;
      }

      const previousDraft = store.get(pageLayoutDraftState);
      const updatedDraft = moveWidgetToGridTabInDraft(previousDraft, {
        widgetId,
        destinationTabId,
      });

      if (updatedDraft === previousDraft) {
        return false;
      }

      store.set(pageLayoutDraftState, updatedDraft);

      const sourceTab = updatedDraft.tabs.find((tab) => tab.id === tabId);
      const destinationTab = updatedDraft.tabs.find(
        (tab) => tab.id === destinationTabId,
      );

      store.set(pageLayoutCurrentLayoutsState, (previousLayouts) => ({
        ...previousLayouts,
        ...(isDefined(sourceTab)
          ? { [tabId]: buildTabWidgetLayouts(sourceTab.widgets) }
          : {}),
        ...(isDefined(destinationTab)
          ? {
              [destinationTabId]: buildTabWidgetLayouts(destinationTab.widgets),
            }
          : {}),
      }));

      store.set(shouldIgnoreNextGridLayoutChangeState, true);

      return true;
    },
    [
      store,
      gridDragHoveredTabIdState,
      findGridDropDestinationTabId,
      pageLayoutDraftState,
      pageLayoutCurrentLayoutsState,
      shouldIgnoreNextGridLayoutChangeState,
      tabId,
    ],
  );

  const consumeShouldIgnoreNextGridLayoutChange = useCallback((): boolean => {
    const shouldIgnore = store.get(shouldIgnoreNextGridLayoutChangeState);

    if (shouldIgnore) {
      store.set(shouldIgnoreNextGridLayoutChangeState, false);
    }

    return shouldIgnore;
  }, [store, shouldIgnoreNextGridLayoutChangeState]);

  return {
    handleGridDrag,
    handleGridDragStop,
    consumeShouldIgnoreNextGridLayoutChange,
  };
};
