import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { isDefined } from 'twenty-shared/utils';

type ReorderTabInDraftParams = {
  tabId: string;
  beforeTabId: string | null;
};

// Repositions a tab relative to another one; beforeTabId null appends it after
// the last active tab. Operating on ids instead of list indices keeps tabs not
// rendered in the tab list (the pinned first tab) in place without index
// arithmetic.
export const reorderTabInDraft = (
  draft: DraftPageLayout,
  { tabId, beforeTabId }: ReorderTabInDraftParams,
): DraftPageLayout => {
  const orderedIds = sortTabsByPosition(
    draft.tabs.filter((tab) => tab.isActive),
  ).map((tab) => tab.id);

  if (!orderedIds.includes(tabId)) {
    return draft;
  }

  const reorderedIds = orderedIds.filter(
    (candidateTabId) => candidateTabId !== tabId,
  );

  const insertIndex = isDefined(beforeTabId)
    ? reorderedIds.indexOf(beforeTabId)
    : reorderedIds.length;

  if (insertIndex < 0) {
    return draft;
  }

  reorderedIds.splice(insertIndex, 0, tabId);

  if (reorderedIds.every((id, index) => id === orderedIds[index])) {
    return draft;
  }

  const newPositionById = new Map(reorderedIds.map((id, index) => [id, index]));

  return {
    ...draft,
    tabs: draft.tabs.map((tab) => {
      const newPosition = newPositionById.get(tab.id);

      return isDefined(newPosition) ? { ...tab, position: newPosition } : tab;
    }),
  };
};
