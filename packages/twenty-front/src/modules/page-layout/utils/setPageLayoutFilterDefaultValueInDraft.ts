import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { getDashboardPageLayoutFilters } from '@/page-layout/utils/getDashboardPageLayoutFilters';
import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

export const setPageLayoutFilterDefaultValueInDraft = ({
  pageLayoutDraft,
  pageLayoutFilterId,
  defaultValue,
}: {
  pageLayoutDraft: DraftPageLayout;
  pageLayoutFilterId: string;
  defaultValue: PageLayoutFilterValue | null;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  filters: getDashboardPageLayoutFilters(pageLayoutDraft.filters).map(
    (filter) =>
      filter.id === pageLayoutFilterId ? { ...filter, defaultValue } : filter,
  ),
});
