import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';

type BuildRecordLabelPayloadArgs = {
  id: string;
  searchInput?: string;
  objectMetadataItem: ObjectMetadataItem;
};

// Builds the initial payload for creating a record based on label identifier type
// Handles FULL_NAME fields by parsing "firstName lastName" from search input
export const buildRecordLabelPayload = ({
  id,
  searchInput,
  objectMetadataItem,
}: BuildRecordLabelPayloadArgs): Record<string, unknown> => {
  const labelIdentifierField =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (labelIdentifierField?.type === FieldMetadataType.FULL_NAME) {
    const words = searchInput?.split(' ') ?? [];
    const hasMultipleWords = words.length > 1;

    return {
      id,
      name: hasMultipleWords
        ? { firstName: words[0], lastName: words.slice(1).join(' ') }
        : { firstName: searchInput ?? '', lastName: '' },
    };
  }

  return { id, name: searchInput ?? '' };
};

