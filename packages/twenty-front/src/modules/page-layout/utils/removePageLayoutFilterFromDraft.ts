import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';

export const removePageLayoutFilterFromDraft = ({
  pageLayoutDraft,
  pageLayoutFilterId,
}: {
  pageLayoutDraft: DraftPageLayout;
  pageLayoutFilterId: string;
}): DraftPageLayout => ({
  ...pageLayoutDraft,
  filters: (pageLayoutDraft.filters ?? []).filter(
    ({ id }) => id !== pageLayoutFilterId,
  ),
});
