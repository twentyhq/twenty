import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { pageLayoutSidePanelOpenState } from '../states/pageLayoutSidePanelOpenState';
import { pageLayoutDraggedAreaState } from '../states/pageLayoutDraggedAreaState';

export const usePageLayoutSidePanel = () => {
  const [pageLayoutSidePanelOpen, setPageLayoutSidePanelOpen] = useRecoilState(
    pageLayoutSidePanelOpenState,
  );
  const [, setPageLayoutDraggedArea] = useRecoilState(
    pageLayoutDraggedAreaState,
  );

  const handleOpenSidePanel = useCallback(() => {
    setPageLayoutSidePanelOpen(true);
  }, [setPageLayoutSidePanelOpen]);

  const handleCloseSidePanel = useCallback(() => {
    setPageLayoutSidePanelOpen(false);
    setPageLayoutDraggedArea(null);
  }, [setPageLayoutSidePanelOpen, setPageLayoutDraggedArea]);

  return {
    pageLayoutSidePanelOpen,
    handleOpenSidePanel,
    handleCloseSidePanel,
  };
};
