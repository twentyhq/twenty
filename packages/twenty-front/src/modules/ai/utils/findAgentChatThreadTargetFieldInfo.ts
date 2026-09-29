import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';

export const findAgentChatThreadTargetFieldInfo = ({
  targetFields,
  objectNameSingular,
  objectMetadataItems,
}: {
  targetFields: FieldMetadataItem[];
  objectNameSingular: string;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}) => {
  const objectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === objectNameSingular,
  );

  return isDefined(objectMetadataItem)
    ? findTargetFieldInfo(
        targetFields,
        objectMetadataItem.id,
        objectMetadataItems,
      )
    : undefined;
};
