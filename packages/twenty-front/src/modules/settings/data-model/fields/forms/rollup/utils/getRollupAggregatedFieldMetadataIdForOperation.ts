import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRollupAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatableFieldMetadataItems';
import {
  AggregateOperations,
  type RollupAggregateOperation,
} from 'twenty-shared/types';

export const getRollupAggregatedFieldMetadataIdForOperation = ({
  aggregateOperation,
  currentAggregatedFieldMetadataId,
  relatedFieldMetadataItems,
}: {
  aggregateOperation: RollupAggregateOperation;
  currentAggregatedFieldMetadataId: string | null;
  relatedFieldMetadataItems: Pick<
    FieldMetadataItem,
    'id' | 'isActive' | 'isSystem' | 'type' | 'settings'
  >[];
}): string | null => {
  if (aggregateOperation === AggregateOperations.COUNT) {
    return null;
  }

  const aggregatableFieldMetadataItems =
    getRollupAggregatableFieldMetadataItems({
      fieldMetadataItems: relatedFieldMetadataItems,
      aggregateOperation,
    });

  const currentStillAggregatable = aggregatableFieldMetadataItems.find(
    ({ id }) => id === currentAggregatedFieldMetadataId,
  );

  return (
    currentStillAggregatable?.id ??
    aggregatableFieldMetadataItems[0]?.id ??
    null
  );
};
