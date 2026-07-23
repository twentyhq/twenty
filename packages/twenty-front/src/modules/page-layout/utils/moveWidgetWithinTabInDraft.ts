import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { reindexWidgetsToVerticalListPositions } from '@/page-layout/utils/reindexWidgetsToVerticalListPositions';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import { isDefined } from 'twenty-shared/utils';
import { moveArrayItem } from '~/utils/array/moveArrayItem';

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
  const reorderedWidgets = moveArrayItem(orderedWidgets, {
    fromIndex,
    toIndex,
  });

  if (reorderedWidgets === orderedWidgets) {
    return draft;
  }

  const reindexedWidgets =
    reindexWidgetsToVerticalListPositions(reorderedWidgets);

  return {
    ...draft,
    tabs: draft.tabs.map((candidateTab) =>
      candidateTab.id === tabId
        ? { ...candidateTab, widgets: reindexedWidgets }
        : candidateTab,
    ),
  };
};
