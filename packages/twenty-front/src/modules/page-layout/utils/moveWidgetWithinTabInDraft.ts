import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';

type MoveWidgetWithinTabInDraftParams = {
  tabId: string;
  fromIndex: number;
  toIndex: number;
};

export const moveWidgetWithinTabInDraft = (
  draft: DraftPageLayout,
  { tabId, fromIndex, toIndex }: MoveWidgetWithinTabInDraftParams,
): DraftPageLayout => {
  const tab = draft.tabs.find((candidateTab) => candidateTab.id === tabId);

  if (!isDefined(tab)) {
    return draft;
  }

  const orderedWidgets = sortWidgetsByVerticalListPosition(tab.widgets);

  if (
    fromIndex < 0 ||
    fromIndex >= orderedWidgets.length ||
    toIndex < 0 ||
    toIndex >= orderedWidgets.length ||
    fromIndex === toIndex
  ) {
    return draft;
  }

  const [movedWidget] = orderedWidgets.splice(fromIndex, 1);
  orderedWidgets.splice(toIndex, 0, movedWidget);

  const reindexedWidgets = orderedWidgets.map((widget, index) => ({
    ...widget,
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
  }));

  return {
    ...draft,
    tabs: draft.tabs.map((candidateTab) =>
      candidateTab.id === tabId
        ? { ...candidateTab, widgets: reindexedWidgets }
        : candidateTab,
    ),
  };
};
