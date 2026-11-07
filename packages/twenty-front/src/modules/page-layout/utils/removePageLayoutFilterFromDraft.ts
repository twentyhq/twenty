import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { sanitizeDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/sanitizeDashboardFilterBindingsInPageLayoutDraft';

export const removePageLayoutFilterFromDraft = ({
  pageLayoutDraft,
  pageLayoutFilterId,
}: {
  pageLayoutDraft: DraftPageLayout;
  pageLayoutFilterId: string;
}): DraftPageLayout =>
  sanitizeDashboardFilterBindingsInPageLayoutDraft({
    pageLayoutDraft: {
      ...pageLayoutDraft,
      filters: (pageLayoutDraft.filters ?? []).filter(
        ({ id }) => id !== pageLayoutFilterId,
      ),
    },
    fieldMetadataItemsByObjectMetadataId: new Map(),
  });
