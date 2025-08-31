import { useRecoilState } from 'recoil';
import { pageLayoutCurrentBreakpointState } from '../states/pageLayoutCurrentBreakpointState';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';
import { pageLayoutSelectedCellsState } from '../states/pageLayoutSelectedCellsState';
import { pageLayoutSidePanelOpenState } from '../states/pageLayoutSidePanelOpenState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

export const usePageLayoutGrid = () => {
  const [pageLayoutCurrentBreakpoint, setPageLayoutCurrentBreakpoint] =
    useRecoilState(pageLayoutCurrentBreakpointState);
  const [pageLayoutSelectedCells, setPageLayoutSelectedCells] = useRecoilState(
    pageLayoutSelectedCellsState,
  );
  const [pageLayoutDraggedArea, setPageLayoutDraggedArea] = useRecoilState(
    pageLayoutDraggedAreaState,
  );
  const [pageLayoutCurrentLayouts, setPageLayoutCurrentLayouts] =
    useRecoilState(pageLayoutCurrentLayoutsState);
  const [pageLayoutWidgets, setPageLayoutWidgets] = useRecoilState(
    pageLayoutWidgetsState,
  );
  const [pageLayoutSidePanelOpen, setPageLayoutSidePanelOpen] = useRecoilState(
    pageLayoutSidePanelOpenState,
  );

  return {
    pageLayoutCurrentBreakpoint,
    setPageLayoutCurrentBreakpoint,
    pageLayoutSelectedCells,
    setPageLayoutSelectedCells,
    pageLayoutDraggedArea,
    setPageLayoutDraggedArea,
    pageLayoutCurrentLayouts,
    setPageLayoutCurrentLayouts,
    pageLayoutWidgets,
    setPageLayoutWidgets,
    pageLayoutSidePanelOpen,
    setPageLayoutSidePanelOpen,
  };
};
