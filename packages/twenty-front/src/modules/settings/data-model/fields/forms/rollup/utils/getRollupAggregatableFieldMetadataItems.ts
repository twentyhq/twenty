import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RollupAggregateOperation } from 'twenty-shared/types';
import {
  computeRollupResultType,
  getFieldMetadataValueType,
  isDefined,
} from 'twenty-shared/utils';

export const getRollupAggregatableFieldMetadataItems = <
  TFieldMetadataItem extends Pick<
    FieldMetadataItem,
    'isActive' | 'isSystem' | 'type' | 'settings'
  >,
>({
  fieldMetadataItems,
  aggregateOperation,
}: {
  fieldMetadataItems: TFieldMetadataItem[];
  aggregateOperation: RollupAggregateOperation;
}): TFieldMetadataItem[] =>
  fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.isSystem !== true &&
      isDefined(
        computeRollupResultType({
          aggregateOperation,
          aggregatedFieldValueType:
            getFieldMetadataValueType(fieldMetadataItem),
        }),
      ),
  );
