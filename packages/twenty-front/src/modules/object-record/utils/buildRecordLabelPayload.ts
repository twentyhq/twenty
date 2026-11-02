import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type BuildRecordLabelPayloadArgs = {
  searchInput?: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const buildRecordLabelPayload = ({
  searchInput,
  objectMetadataItem,
}: BuildRecordLabelPayloadArgs): Record<string, unknown> => {
  const labelIdentifierField =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (
    !isDefined(labelIdentifierField) ||
    (labelIdentifierField.type !== FieldMetadataType.TEXT &&
      labelIdentifierField.type !== FieldMetadataType.FULL_NAME)
  ) {
    return {};
  }

  const fieldName = labelIdentifierField.name;

  if (labelIdentifierField.type === FieldMetadataType.FULL_NAME) {
    const words = searchInput?.split(' ') ?? [];
    const hasMultipleWords = words.length > 1;

    return {
      [fieldName]: hasMultipleWords
        ? { firstName: words[0], lastName: words.slice(1).join(' ') }
        : { firstName: searchInput ?? '', lastName: '' },
    };
  }

  return { [fieldName]: searchInput ?? '' };
};
