import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useAtomComponentStateCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const contextStoreIsFullTabWidgetInEditModeState =
    useAtomComponentStateCallbackState(
      contextStoreIsPageInEditModeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const store = useStore();

  const setIsPageLayoutInEditMode = useCallback(
    (value: boolean) => {
      store.set(isPageLayoutInEditModeState, value);

      store.set(contextStoreIsFullTabWidgetInEditModeState, value);

      store.set(currentPageLayoutIdState.atom, value ? pageLayoutId : null);

      const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

      if (isSidePanelOpened) {
        store.set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
          }),
          value,
        );
      }
    },
    [
      isPageLayoutInEditModeState,
      contextStoreIsFullTabWidgetInEditModeState,
      pageLayoutId,
      store,
    ],
  );

  return { setIsPageLayoutInEditMode };
};
