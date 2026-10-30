import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RelatedRecordPathStep } from '@/related-record-paths/types/RelatedRecordPathStep';

export const getRelatedRecordPathSteps = ({
  sourceObjectMetadataItem,
  fieldMetadataIds,
  objectMetadataItems,
}: {
  sourceObjectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataIds: string[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RelatedRecordPathStep[] => {
  const steps: RelatedRecordPathStep[] = [];
  let currentObjectMetadataItem = sourceObjectMetadataItem;

  for (const fieldMetadataId of fieldMetadataIds) {
    const fieldMetadataItem = currentObjectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );

    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadataItem?.relation?.targetObjectMetadata.id,
    );

    if (!isDefined(fieldMetadataItem) || !isDefined(targetObjectMetadataItem)) {
      break;
    }

    steps.push({ fieldMetadataItem, targetObjectMetadataItem });
    currentObjectMetadataItem = targetObjectMetadataItem;
  }

  return steps;
};
