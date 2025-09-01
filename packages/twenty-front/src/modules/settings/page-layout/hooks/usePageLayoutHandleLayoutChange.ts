import { type Layout, type Layouts } from 'react-grid-layout';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = () => {
  const [, setPageLayoutCurrentLayouts] = useRecoilState(
    pageLayoutCurrentLayoutsState,
  );
  const pageLayoutWidgets = useRecoilValue(pageLayoutWidgetsState);
  const setPageLayoutDraft = useSetRecoilState(pageLayoutDraftState);

  const handleLayoutChange = (_: Layout[], allLayouts: Layouts) => {
    setPageLayoutCurrentLayouts(allLayouts);

    const updatedWidgets = convertLayoutsToWidgets(
      pageLayoutWidgets,
      allLayouts,
    );

    setPageLayoutDraft((prev) => ({
      ...prev,
      widgets: updatedWidgets,
    }));
  };

  return { handleLayoutChange };
};
