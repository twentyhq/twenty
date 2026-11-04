import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RelatedRecordPathStep } from '@/related-record-paths/types/RelatedRecordPathStep';

export const getRelatedRecordPathNextFieldMetadataItems = ({
  sourceObjectMetadataItem,
  steps,
}: {
  sourceObjectMetadataItem: Pick<EnrichedObjectMetadataItem, 'id' | 'fields'>;
  steps: RelatedRecordPathStep[];
}): FieldMetadataItem[] => {
  const reachedObjectMetadataItem =
    steps.at(-1)?.targetObjectMetadataItem ?? sourceObjectMetadataItem;

  const visitedObjectMetadataIds = new Set([
    sourceObjectMetadataItem.id,
    ...steps.map((step) => step.targetObjectMetadataItem.id),
  ]);

  return reachedObjectMetadataItem.fields.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION &&
      field.isActive &&
      isDefined(field.relation) &&
      !visitedObjectMetadataIds.has(field.relation.targetObjectMetadata.id),
  );
};
