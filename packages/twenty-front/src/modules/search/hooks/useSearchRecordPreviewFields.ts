import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { useViewOrDefaultView } from '@/views/hooks/useViewOrDefaultView';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

// The preview mirrors the columns of the object's index view, so what you see
// while searching matches the list view you came from. Columns hidden in that
// view stay available behind the "More" expander.
export const useSearchRecordPreviewFields = (
  objectMetadataItem: EnrichedObjectMetadataItem,
): {
  visibleFields: FieldMetadataItem[];
  hiddenFields: FieldMetadataItem[];
} => {
  const { view } = useViewOrDefaultView({
    objectMetadataItemId: objectMetadataItem.id,
  });

  return useMemo(() => {
    if (!isDefined(view)) {
      return { visibleFields: [], hiddenFields: [] };
    }

    const readableActiveFields = objectMetadataItem.readableFields.filter(
      (fieldMetadata) =>
        isActiveFieldMetadataItem({
          objectNameSingular: objectMetadataItem.nameSingular,
          fieldMetadata,
        }),
    );

    const sortedViewFields = [...view.viewFields].sort(
      (a, b) => a.position - b.position,
    );

    const toFieldMetadataItems = (isVisible: boolean) =>
      sortedViewFields
        .filter((viewField) => viewField.isVisible === isVisible)
        .map((viewField) =>
          readableActiveFields.find(
            (field) => field.id === viewField.fieldMetadataId,
          ),
        )
        .filter(isDefined)
        .filter(
          (field) =>
            field.id !== objectMetadataItem.labelIdentifierFieldMetadataId,
        );

    return {
      visibleFields: toFieldMetadataItems(true),
      hiddenFields: toFieldMetadataItems(false),
    };
  }, [view, objectMetadataItem]);
};
