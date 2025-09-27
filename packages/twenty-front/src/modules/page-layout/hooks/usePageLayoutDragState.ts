import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { isPageLayoutDraggingTabComponentState } from '@/page-layout/states/isPageLayoutDraggingTabComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';

export const usePageLayoutDragState = (pageLayoutIdFromProps?: string) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const isDraggingTab = useRecoilComponentValue(
    isPageLayoutDraggingTabComponentState,
    pageLayoutId,
  );

  const setIsDraggingTab = useSetRecoilComponentState(
    isPageLayoutDraggingTabComponentState,
    pageLayoutId,
  );

  return {
    isDraggingTab,
    setIsDraggingTab,
  };
};
