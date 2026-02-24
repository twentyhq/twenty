import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';

export const useWidgetInEditMode = (pageLayoutId: string) => {
  const draftPageLayout = useAtomComponentValue(
    pageLayoutDraftComponentState,
    pageLayoutId,
  );

  const pageLayoutEditingWidgetId = useAtomComponentValue(
    pageLayoutEditingWidgetIdComponentState,
    pageLayoutId,
  );

  const widgetInEditMode = draftPageLayout.tabs
    .flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === pageLayoutEditingWidgetId);

  return { widgetInEditMode };
};
