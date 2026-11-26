import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const getListPinnedFieldMetadataIds = ({
  listPinnedFieldUniversalIdentifiers,
  fieldMetadataItems,
}: {
  listPinnedFieldUniversalIdentifiers: string[] | null | undefined;
  fieldMetadataItems: Pick<FieldMetadataItem, 'id' | 'universalIdentifier'>[];
}): string[] =>
  (listPinnedFieldUniversalIdentifiers ?? [])
    .map(
      (listPinnedFieldUniversalIdentifier) =>
        fieldMetadataItems.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.universalIdentifier ===
            listPinnedFieldUniversalIdentifier,
        )?.id,
    )
    .filter(isDefined);
