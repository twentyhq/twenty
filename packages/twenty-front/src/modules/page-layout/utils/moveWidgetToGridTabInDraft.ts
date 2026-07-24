import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getWidgetGridPosition } from '@/page-layout/utils/getWidgetGridPosition';

type MoveWidgetToGridTabInDraftParams = {
  widgetId: string;
  destinationTabId: string;
};

// Moves a widget into a grid tab, placing it full-left below the lowest
// existing widget so it never overlaps the destination layout.
export const moveWidgetToGridTabInDraft = (
  draft: DraftPageLayout,
  { widgetId, destinationTabId }: MoveWidgetToGridTabInDraftParams,
): DraftPageLayout => {
  const sourceTab = draft.tabs.find((tab) =>
    tab.widgets.some((widget) => widget.id === widgetId),
  );

  if (!isDefined(sourceTab) || sourceTab.id === destinationTabId) {
    return draft;
  }

  const destinationTab = draft.tabs.find((tab) => tab.id === destinationTabId);

  if (
    !isDefined(destinationTab) ||
    destinationTab.layoutMode === PageLayoutTabLayoutMode.VERTICAL_LIST
  ) {
    return draft;
  }

  const widget = sourceTab.widgets.find(
    (candidateWidget) => candidateWidget.id === widgetId,
  );

  if (!isDefined(widget)) {
    return draft;
  }

  const destinationBottomRow = destinationTab.widgets.reduce(
    (bottomRow, destinationWidget) => {
      const gridPosition = getWidgetGridPosition(destinationWidget);

      return Math.max(
        bottomRow,
        (gridPosition?.row ?? 0) + (gridPosition?.rowSpan ?? 0),
      );
    },
    0,
  );

  const widgetGridPosition = getWidgetGridPosition(widget);
  const rowSpan = widgetGridPosition?.rowSpan ?? 2;
  const columnSpan = widgetGridPosition?.columnSpan ?? 2;

  const movedWidget: PageLayoutWidget = {
    ...widget,
    pageLayoutTabId: destinationTabId,
    gridPosition: {
      row: destinationBottomRow,
      column: 0,
      rowSpan,
      columnSpan,
    },
    position: {
      __typename: 'PageLayoutWidgetGridPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: destinationBottomRow,
      column: 0,
      rowSpan,
      columnSpan,
    },
  };

  return {
    ...draft,
    tabs: draft.tabs.map((tab) => {
      if (tab.id === sourceTab.id) {
        return {
          ...tab,
          widgets: tab.widgets.filter((tabWidget) => tabWidget.id !== widgetId),
        };
      }
      if (tab.id === destinationTabId) {
        return { ...tab, widgets: [...tab.widgets, movedWidget] };
      }
      return tab;
    }),
  };
};
