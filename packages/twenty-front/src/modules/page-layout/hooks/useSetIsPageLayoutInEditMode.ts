import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreIsPageInEditModeComponentState } from '@/context-store/states/contextStoreIsPageInEditModeComponentState';
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
      contextStoreIsPageInEditModeComponentState,
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
