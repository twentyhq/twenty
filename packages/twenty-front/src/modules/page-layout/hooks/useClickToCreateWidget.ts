import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { parseCellIdToCoordinates } from '@/page-layout/utils/parseCellIdToCoordinates';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilCallback } from 'recoil';

export const useClickToCreateWidget = () => {
  const pageLayoutDraggedAreaState = useRecoilComponentCallbackState(
    pageLayoutDraggedAreaComponentState,
  );

  const pageLayoutEditingWidgetIdState = useRecoilComponentCallbackState(
    pageLayoutEditingWidgetIdComponentState,
  );

  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();

  const clickToCreateWidget = useRecoilCallback(
    ({ set }) =>
      (cellId: string) => {
        const { col, row } = parseCellIdToCoordinates(cellId);
        const bounds = { x: col, y: row, w: 1, h: 1 };

        set(pageLayoutDraggedAreaState, bounds);
        set(pageLayoutEditingWidgetIdState, null);

        navigatePageLayoutCommandMenu({
          commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
          resetNavigationStack: true,
        });
      },
    [
      navigatePageLayoutCommandMenu,
      pageLayoutDraggedAreaState,
      pageLayoutEditingWidgetIdState,
    ],
  );

  return { clickToCreateWidget };
};
