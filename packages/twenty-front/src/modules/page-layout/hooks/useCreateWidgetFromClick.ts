import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { parseCellIdToCoordinates } from '@/page-layout/utils/parseCellIdToCoordinates';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';

export const useCreateWidgetFromClick = () => {
  const pageLayoutDraggedAreaState = useRecoilComponentStateCallbackStateV2(
    pageLayoutDraggedAreaComponentState,
  );

  const pageLayoutEditingWidgetIdState = useRecoilComponentStateCallbackStateV2(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const store = useStore();

  const createWidgetFromClick = useCallback(
    (cellId: string) => {
      const { col, row } = parseCellIdToCoordinates(cellId);
      const bounds = { x: col, y: row, w: 1, h: 1 };

      store.set(pageLayoutDraggedAreaState, bounds);
      store.set(pageLayoutEditingWidgetIdState, null);

      navigatePageLayoutCommandMenu({
        commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
        resetNavigationStack: true,
      });
    },
    [
      navigatePageLayoutCommandMenu,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
      store,
    ],
  );

  return { createWidgetFromClick };
};
