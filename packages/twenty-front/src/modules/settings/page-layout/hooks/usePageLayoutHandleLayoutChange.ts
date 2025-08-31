import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { type Layout, type Layouts } from 'react-grid-layout';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';

export const usePageLayoutHandleLayoutChange = () => {
  const [, setPageLayoutCurrentLayouts] = useRecoilState(
    pageLayoutCurrentLayoutsState,
  );

  const handleLayoutChange = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      setPageLayoutCurrentLayouts(allLayouts);
    },
    [setPageLayoutCurrentLayouts],
  );

  return { handleLayoutChange };
};
