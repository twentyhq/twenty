import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { filterDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/filterDashboardFilterBindingsInPageLayoutDraft';
import { isUndefined } from '@sniptt/guards';

export const dropDashboardFilterBindingsToRemovedFilters = (
  pageLayoutDraft: DraftPageLayout,
): DraftPageLayout => {
  // Without loaded filters the save keeps the stored ones, so every binding still has its filter
  if (isUndefined(pageLayoutDraft.filters)) {
    return pageLayoutDraft;
  }

  const pageLayoutFilterIds = new Set(
    (pageLayoutDraft.filters ?? []).map(({ id }) => id),
  );

  return filterDashboardFilterBindingsInPageLayoutDraft({
    pageLayoutDraft,
    isBindingKept: ({ pageLayoutFilterId }) =>
      pageLayoutFilterIds.has(pageLayoutFilterId),
  });
};
