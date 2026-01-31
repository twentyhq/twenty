import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { isPageLayoutInEditModeComponentState } from '@/page-layout/states/isPageLayoutInEditModeComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useSetIsPageLayoutInEditMode = (pageLayoutIdFromProps: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isPageLayoutInEditModeState = useRecoilComponentCallbackState(
    isPageLayoutInEditModeComponentState,
    pageLayoutId,
  );

  const contextStoreIsFullTabWidgetInEditModeState =
    useRecoilComponentCallbackState(
      contextStoreIsPageInEditModeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const setIsPageLayoutInEditMode = useRecoilCallback(
    ({ set, snapshot }) =>
      (value: boolean) => {
        set(isPageLayoutInEditModeState, value);

        set(contextStoreIsFullTabWidgetInEditModeState, value);

        set(currentPageLayoutIdState, value ? pageLayoutId : null);

        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          set(
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
    ],
  );

  return { setIsPageLayoutInEditMode };
};
