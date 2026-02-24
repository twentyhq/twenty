import { PageLayoutComponentInstanceContext } from '@/page-layout/states/contexts/PageLayoutComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { pageLayoutSelectedCellsComponentState } from '@/page-layout/states/pageLayoutSelectedCellsComponentState';

export const useStartPageLayoutDragSelection = (
  pageLayoutIdFromProps?: string,
) => {
  const pageLayoutId = useAvailableComponentInstanceIdOrThrow(
    PageLayoutComponentInstanceContext,
    pageLayoutIdFromProps,
  );

  const pageLayoutSelectedCellsState = useRecoilComponentStateCallbackStateV2(
    pageLayoutSelectedCellsComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const startPageLayoutDragSelection = useCallback(() => {
    store.set(pageLayoutSelectedCellsState, new Set());
  }, [pageLayoutSelectedCellsState, store]);

  return { startPageLayoutDragSelection };
};
