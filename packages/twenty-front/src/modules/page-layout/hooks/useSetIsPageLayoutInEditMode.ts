import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { hasInitializedFieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/hasInitializedFieldsWidgetGroupsDraftComponentState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isDashboardInEditModeState = useAtomComponentStateCallbackState(
    isDashboardInEditModeComponentState,
    pageLayoutId,
  );

  const contextStoreIsFullTabWidgetInEditModeState =
    useAtomComponentStateCallbackState(
      contextStoreIsPageInEditModeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const hasInitializedFieldsWidgetGroupsDraftState =
    useAtomComponentStateCallbackState(
      hasInitializedFieldsWidgetGroupsDraftComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const setIsPageLayoutInEditMode = useCallback(
    (value: boolean) => {
      if (value) {
        store.set(fieldsWidgetGroupsDraftState, {});
        store.set(fieldsWidgetUngroupedFieldsDraftState, {});
        store.set(fieldsWidgetEditorModeDraftState, {});
        store.set(hasInitializedFieldsWidgetGroupsDraftState, {});
      }

      store.set(isDashboardInEditModeState, value);

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
      isDashboardInEditModeState,
      contextStoreIsFullTabWidgetInEditModeState,
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetEditorModeDraftState,
      hasInitializedFieldsWidgetGroupsDraftState,
      pageLayoutId,
      store,
    ],
  );

  return { setIsPageLayoutInEditMode };
};
