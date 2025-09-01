import { type Layout, type Layouts } from 'react-grid-layout';
import { useRecoilCallback } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { convertLayoutsToWidgets } from '../utils/convertLayoutsToWidgets';

export const usePageLayoutHandleLayoutChange = () => {
  const handleLayoutChange = useRecoilCallback(
    ({ snapshot, set }) =>
      (_: Layout[], allLayouts: Layouts) => {
        set(pageLayoutCurrentLayoutsState, allLayouts);

        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();

        const updatedWidgets = convertLayoutsToWidgets(
          pageLayoutWidgets,
          allLayouts,
        );

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          widgets: updatedWidgets,
        }));
      },
    [],
  );

  return { handleLayoutChange };
};
