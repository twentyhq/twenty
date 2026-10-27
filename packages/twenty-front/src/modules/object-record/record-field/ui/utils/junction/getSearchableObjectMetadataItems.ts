import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getPermittedJunctionTargetFields } from '@/object-record/record-field/ui/utils/junction/getPermittedJunctionTargetFields';
import { getTargetObjectMetadataIdsFromField } from '@/object-record/record-field/ui/utils/junction/getTargetObjectMetadataIdsFromField';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { isDefined } from 'twenty-shared/utils';

export const getSearchableObjectMetadataItems = ({
  junctionConfig: { junctionObjectMetadata, targetFields },
  objectMetadataItems,
}: {
  junctionConfig: Pick<
    ValidJunctionConfig,
    'junctionObjectMetadata' | 'targetFields'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): EnrichedObjectMetadataItem[] => {
  const targetObjectIds = getPermittedJunctionTargetFields({
    targetFields,
    permittedFields: junctionObjectMetadata.updatableFields,
  }).flatMap(getTargetObjectMetadataIdsFromField);
  const uniqueTargetObjectIds = [...new Set(targetObjectIds)];

  return uniqueTargetObjectIds
    .map((id) => objectMetadataItems.find((item) => item.id === id))
    .filter(isDefined);
};
