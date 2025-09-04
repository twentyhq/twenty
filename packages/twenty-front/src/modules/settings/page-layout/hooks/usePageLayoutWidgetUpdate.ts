import { useRecoilCallback } from 'recoil';
import { type Widget } from '../mocks/mockWidgets';
import { pageLayoutDraftState } from '../states/pageLayoutDraftState';
import { pageLayoutWidgetsState } from '../states/pageLayoutWidgetsState';

export const usePageLayoutWidgetUpdate = () => {
  const handleUpdateWidget = useRecoilCallback(
    ({ snapshot, set }) =>
      (widgetId: string, updates: Partial<Widget>) => {
        const pageLayoutWidgets = snapshot
          .getLoadable(pageLayoutWidgetsState)
          .getValue();
        const pageLayoutDraft = snapshot
          .getLoadable(pageLayoutDraftState)
          .getValue();

        const updatedWidgets = pageLayoutWidgets.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget,
        );
        set(pageLayoutWidgetsState, updatedWidgets);

        const updatedDraftWidgets = pageLayoutDraft.widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget,
        );

        set(pageLayoutDraftState, {
          ...pageLayoutDraft,
          widgets: updatedDraftWidgets,
        });
      },
    [],
  );

  return { handleUpdateWidget };
};
