import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isVerticalListPosition } from '@/page-layout/utils/isVerticalListPosition';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

const toVerticalListPosition = (index: number) =>
  ({
    __typename: 'PageLayoutWidgetVerticalListPosition' as const,
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index,
  }) satisfies PageLayoutWidget['position'];

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

  if (!isDefined(destinationTab)) {
    return draft;
  }

  const widget = sourceTab.widgets.find(
    (candidateWidget) => candidateWidget.id === widgetId,
  );

  if (!isDefined(widget)) {
    return draft;
  }

  const remainingWidgets = sortWidgetsByVerticalListPosition(sourceTab.widgets)
    .filter((tabWidget) => tabWidget.id !== widgetId)
    .map((tabWidget, widgetIndex) => ({
      ...tabWidget,
      position:
        isDefined(tabWidget.position) &&
        isVerticalListPosition(tabWidget.position)
          ? toVerticalListPosition(widgetIndex)
          : tabWidget.position,
    }));

  const insertAtEnd = !isDefined(destinationIndex);

  const destinationWidgets: PageLayoutWidget[] = insertAtEnd
    ? [
        ...destinationTab.widgets,
        {
          ...widget,
          pageLayoutTabId: destinationTabId,
          position: toVerticalListPosition(destinationTab.widgets.length),
        },
      ]
    : (() => {
        const sortedDestination = sortWidgetsByVerticalListPosition(
          destinationTab.widgets,
        );
        const clampedIndex = Math.max(
          0,
          Math.min(destinationIndex, sortedDestination.length),
        );
        sortedDestination.splice(clampedIndex, 0, {
          ...widget,
          pageLayoutTabId: destinationTabId,
          position: toVerticalListPosition(clampedIndex),
        });
        return sortedDestination.map((tabWidget, widgetIndex) => ({
          ...tabWidget,
          position: toVerticalListPosition(widgetIndex),
        }));
      })();

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
