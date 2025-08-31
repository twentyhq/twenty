import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';

export const usePageLayoutWidgetDelete = () => {
  const [pageLayoutWidgets, setPageLayoutWidgets] = useRecoilState(
    pageLayoutWidgetsState,
  );
  const [pageLayoutCurrentLayouts, setPageLayoutCurrentLayouts] =
    useRecoilState(pageLayoutCurrentLayoutsState);

  const handleRemoveWidget = useCallback(
    (widgetId: string) => {
      const updatedWidgets = pageLayoutWidgets.filter((w) => w.id !== widgetId);
      setPageLayoutWidgets(updatedWidgets);

      const updatedLayouts = {
        desktop: (pageLayoutCurrentLayouts.desktop || []).filter(
          (layout) => layout.i !== widgetId,
        ),
        mobile: (pageLayoutCurrentLayouts.mobile || []).filter(
          (layout) => layout.i !== widgetId,
        ),
      };
      setPageLayoutCurrentLayouts(updatedLayouts);
    },
    [
      pageLayoutWidgets,
      pageLayoutCurrentLayouts,
      setPageLayoutWidgets,
      setPageLayoutCurrentLayouts,
    ],
  );

  return { handleRemoveWidget };
};
