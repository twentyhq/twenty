import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RelatedRecordPathStep } from '@/related-record-paths/types/RelatedRecordPathStep';
import { findRelationTargetObjectMetadataItem } from '@/related-record-paths/utils/findRelationTargetObjectMetadataItem';

export const getRelatedRecordPathSteps = ({
  sourceObjectMetadataItem,
  fieldMetadataIds,
  objectMetadataItems,
}: {
  sourceObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'>;
  fieldMetadataIds: string[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
}): RelatedRecordPathStep[] => {
  const steps: RelatedRecordPathStep[] = [];
  let currentObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'fields'> =
    sourceObjectMetadataItem;

  for (const fieldMetadataId of fieldMetadataIds) {
    const fieldMetadataItem = currentObjectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      break;
    }

    const targetObjectMetadataItem = findRelationTargetObjectMetadataItem({
      fieldMetadataItem,
      objectMetadataItems,
    });

    if (!isDefined(targetObjectMetadataItem)) {
      break;
    }

    steps.push({ fieldMetadataItem, targetObjectMetadataItem });
    currentObjectMetadataItem = targetObjectMetadataItem;
  }

  return steps;
};
