import { useRecoilCallback } from 'recoil';
import { pageLayoutCurrentLayoutsState } from '../states/pageLayoutCurrentLayoutsState';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

export const usePageLayoutWidgetDelete = () => {
  const handleRemoveWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const pageLayoutCurrentLayouts = snapshot
          .getLoadable(pageLayoutCurrentLayoutsState)
          .getValue();

        const updatedWidgets = pageLayoutWidgets.filter(
          (w) => w.id !== widgetId,
        );
        set(pageLayoutWidgetsState, updatedWidgets);

        const updatedLayouts = {
          desktop: (pageLayoutCurrentLayouts.desktop || []).filter(
            (layout) => layout.i !== widgetId,
          ),
          mobile: (pageLayoutCurrentLayouts.mobile || []).filter(
            (layout) => layout.i !== widgetId,
          ),
        };
        set(pageLayoutCurrentLayoutsState, updatedLayouts);

        set(pageLayoutDraftState, (prev) => ({
          ...prev,
          widgets: prev.widgets.filter((w) => w.id !== widgetId),
        }));
      },
    [],
  );

  return { handleRemoveWidget };
};
