import { IS_PAGE_LAYOUT_IN_EDIT_MODE_COMPONENT_STATE_KEY } from '@/page-layout/states/constants/IsPageLayoutInEditModeComponentStateKey';
import { PAGE_LAYOUT_CURRENT_LAYOUTS_COMPONENT_STATE_KEY } from '@/page-layout/states/constants/PageLayoutCurrentLayoutsComponentStateKey';
import { PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY } from '@/page-layout/states/constants/PageLayoutDraftComponentStateKey';
import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { getComponentStateStorageKey } from '@/page-layout/utils/getComponentStateStorageKey';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useCallback } from 'react';

export const useClearDraftPageLayoutFromLocalStorage = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const clearDraftPageLayoutFromLocalStorage = useCallback(() => {
    const draftStorageKey = getComponentStateStorageKey({
      componentStateKey: PAGE_LAYOUT_DRAFT_COMPONENT_STATE_KEY,
      instanceId: pageLayoutId,
    });
    localStorage.removeItem(draftStorageKey);

    const layoutsStorageKey = getComponentStateStorageKey({
      componentStateKey: PAGE_LAYOUT_CURRENT_LAYOUTS_COMPONENT_STATE_KEY,
      instanceId: pageLayoutId,
    });
    localStorage.removeItem(layoutsStorageKey);

    const editModeStorageKey = getComponentStateStorageKey({
      componentStateKey: IS_PAGE_LAYOUT_IN_EDIT_MODE_COMPONENT_STATE_KEY,
      instanceId: pageLayoutId,
    });
    localStorage.removeItem(editModeStorageKey);
  }, [pageLayoutId]);

  return { clearDraftPageLayoutFromLocalStorage };
};
