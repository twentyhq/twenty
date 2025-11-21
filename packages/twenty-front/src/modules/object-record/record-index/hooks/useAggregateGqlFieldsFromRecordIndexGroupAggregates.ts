import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { AggregateOperations } from '~/generated/graphql';

export const useAggregateGqlFieldsFromRecordIndexGroupAggregates = ({
  objectMetadataItem,
  recordIndexGroupAggregateFieldMetadataItem,
  recordIndexGroupAggregateOperation,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordIndexGroupAggregateFieldMetadataItem: Nullable<FieldMetadataItem>;
  recordIndexGroupAggregateOperation: ExtendedAggregateOperations;
}) => {
  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  if (recordIndexGroupAggregateOperation === AggregateOperations.COUNT) {
    return {
      recordAggregateGqlField: 'totalCount',
    };
  }

  if (!isDefined(recordIndexGroupAggregateFieldMetadataItem)) {
    throw new Error(
      `Cannot query an aggregate without a field metadata item for ${objectMetadataItem.nameSingular}, aggregate operation : ${recordIndexGroupAggregateOperation}`,
    );
  }

  const recordAggregateGqlField =
    availableAggregations[recordIndexGroupAggregateFieldMetadataItem.name]?.[
      recordIndexGroupAggregateOperation
    ];

  if (!isDefined(recordAggregateGqlField)) {
    return { recordAggregateGqlField: null };
  }

  return { recordAggregateGqlField };
};
