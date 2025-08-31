import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { type Widget } from '../mocks/mockWidgets';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { type SavedPageLayout } from '../states/savedPageLayoutsState';

export const usePageLayoutInitialize = (existingLayout?: SavedPageLayout) => {
  const setPageLayoutWidgets = useSetRecoilState(pageLayoutWidgetsState);
  const setPageLayoutCurrentLayouts = useSetRecoilState(
    pageLayoutCurrentLayoutsState,
  );

  useEffect(() => {
    if (isDefined(existingLayout)) {
      const widgets: Widget[] = existingLayout.widgets.map((w) => ({
        id: w.id,
        title: w.title,
        type: w.type,
        graphType: w.graphType as any,
        data: w.data,
      }));
      setPageLayoutWidgets(widgets);

      const layouts = existingLayout.widgets.map((w) => ({
        i: w.id,
        x: w.gridPosition.column,
        y: w.gridPosition.row,
        w: w.gridPosition.columnSpan,
        h: w.gridPosition.rowSpan,
      }));
      setPageLayoutCurrentLayouts({
        desktop: layouts,
        mobile: layouts.map((l) => ({ ...l, w: 1, x: 0 })),
      });
    }
  }, [existingLayout, setPageLayoutWidgets, setPageLayoutCurrentLayouts]);
};
