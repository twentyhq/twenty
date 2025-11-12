import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsFullTabWidgetInEditModeComponentState } from '@/context-store/states/contextStoreIsFullTabWidgetInEditModeComponentState';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
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
      contextStoreIsFullTabWidgetInEditModeComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const setIsPageLayoutInEditMode = useRecoilCallback(
    ({ set }) =>
      (value: boolean) => {
        set(isPageLayoutInEditModeState, value);

        set(contextStoreIsFullTabWidgetInEditModeState, value);
      },
    [isPageLayoutInEditModeState, contextStoreIsFullTabWidgetInEditModeState],
  );

  return { setIsPageLayoutInEditMode };
};
