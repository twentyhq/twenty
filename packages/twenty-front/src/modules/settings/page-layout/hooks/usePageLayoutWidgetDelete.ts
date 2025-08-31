import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

export const usePageLayoutWidgetDelete = () => {
  const [pageLayoutWidgets, setPageLayoutWidgets] = useRecoilState(
    pageLayoutWidgetsState,
  );
  const [pageLayoutCurrentLayouts, setPageLayoutCurrentLayouts] =
    useRecoilState(pageLayoutCurrentLayoutsState);
  const setPageLayoutDraft = useSetRecoilState(pageLayoutDraftState);

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

      setPageLayoutDraft((prev) => ({
        ...prev,
        widgets: prev.widgets.filter((w) => w.id !== widgetId),
      }));
    },
    [
      pageLayoutWidgets,
      pageLayoutCurrentLayouts,
      setPageLayoutWidgets,
      setPageLayoutCurrentLayouts,
      setPageLayoutDraft,
    ],
  );

  return { handleRemoveWidget };
};
