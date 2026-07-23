import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { reindexWidgetsToVerticalListPositions } from '@/page-layout/utils/reindexWidgetsToVerticalListPositions';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type MoveWidgetToTabInDraftParams = {
  widgetId: string;
  destinationTabId: string;
  destinationIndex?: number;
};

export const moveWidgetToTabInDraft = (
  draft: DraftPageLayout,
  {
    widgetId,
    destinationTabId,
    destinationIndex,
  }: MoveWidgetToTabInDraftParams,
): DraftPageLayout => {
  const sourceTab = draft.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === widgetId),
  );

  if (!isDefined(sourceTab) || sourceTab.id === destinationTabId) {
    return draft;
  }

  const destinationTab = draft.tabs.find((tab) => tab.id === destinationTabId);

  // Widgets carry vertical-list positions, so moving one into a canvas/grid tab
  // would reindex that tab's widgets and clobber their native placement.
  if (
    !isDefined(destinationTab) ||
    destinationTab.layoutMode !== PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return draft;
  }

  const widget = sourceTab.widgets.find(
    (candidateWidget) => candidateWidget.id === widgetId,
  );

  if (!isDefined(widget)) {
    return draft;
  }

  const remainingWidgets = reindexWidgetsToVerticalListPositions(
    sortWidgetsByVerticalListPosition(sourceTab.widgets).filter(
      (tabWidget) => tabWidget.id !== widgetId,
    ),
  );

  const sortedDestinationWidgets = sortWidgetsByVerticalListPosition(
    destinationTab.widgets,
  );
  const insertIndex = isDefined(destinationIndex)
    ? Math.max(0, Math.min(destinationIndex, sortedDestinationWidgets.length))
    : sortedDestinationWidgets.length;

  sortedDestinationWidgets.splice(insertIndex, 0, {
    ...widget,
    pageLayoutTabId: destinationTabId,
  });

  const destinationWidgets = reindexWidgetsToVerticalListPositions(
    sortedDestinationWidgets,
  );

  return {
    ...draft,
    tabs: draft.tabs.map((tab) => {
      if (tab.id === sourceTab.id) {
        return { ...tab, widgets: remainingWidgets };
      }
      if (tab.id === destinationTabId) {
        return { ...tab, widgets: destinationWidgets };
      }
      return tab;
    }),
  };
};
