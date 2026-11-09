import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { filterDashboardFilterBindingsInPageLayoutDraft } from '@/page-layout/utils/filterDashboardFilterBindingsInPageLayoutDraft';
import { isDefined } from 'twenty-shared/utils';

// The server rejects such an override, so dropping it never changes a binding it would accept
export const dropDashboardFilterOverridesToMissingFields = ({
  pageLayoutDraft,
  fieldMetadataItemsByObjectMetadataId,
}: {
  pageLayoutDraft: DraftPageLayout;
  fieldMetadataItemsByObjectMetadataId: Map<
    string,
    Pick<FieldMetadataItem, 'id'>[]
  >;
}): DraftPageLayout =>
  filterDashboardFilterBindingsInPageLayoutDraft({
    pageLayoutDraft,
    isBindingKept: ({ binding: { fieldMetadataId }, widget }) => {
      const fieldMetadataItems = isDefined(widget.objectMetadataId)
        ? fieldMetadataItemsByObjectMetadataId.get(widget.objectMetadataId)
        : undefined;

      return (
        !isDefined(fieldMetadataId) ||
        !isDefined(fieldMetadataItems) ||
        fieldMetadataItems.some(({ id }) => id === fieldMetadataId)
      );
    },
  });
