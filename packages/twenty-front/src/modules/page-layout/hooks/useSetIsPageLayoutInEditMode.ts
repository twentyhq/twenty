import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useRecoilComponentStateCallbackStateV2(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const contextStoreIsFullTabWidgetInEditModeState =
    useRecoilComponentStateCallbackStateV2(
      contextStoreIsPageInEditModeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const store = useStore();

  const setIsPageLayoutInEditMode = useCallback(
    (value: boolean) => {
      store.set(isPageLayoutInEditModeState, value);

      store.set(contextStoreIsFullTabWidgetInEditModeState, value);

      store.set(currentPageLayoutIdState.atom, value ? pageLayoutId : null);

      const isCommandMenuOpened = store.get(isCommandMenuOpenedStateV2.atom);

      if (isCommandMenuOpened) {
        store.set(
          contextStoreIsPageInEditModeComponentState.atomFamily({
            instanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
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
