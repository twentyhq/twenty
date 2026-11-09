import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { getEffectiveDashboardPageLayoutFilters } from 'twenty-shared/utils';
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
  filters: getEffectiveDashboardPageLayoutFilters(pageLayoutDraft.filters).map(
    (filter) =>
      filter.id === pageLayoutFilterId ? { ...filter, defaultValue } : filter,
  ),
});
