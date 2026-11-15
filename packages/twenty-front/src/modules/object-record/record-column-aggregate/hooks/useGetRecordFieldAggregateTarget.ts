import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

// With the flag off an aggregate column renders and loads as its plain relation
export const useGetRecordFieldAggregateTarget = () => {
  const isLookupColumnsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  return useCallback(
    ({
      recordField,
      fieldMetadataItem,
    }: {
      recordField: Pick<
        RecordField,
        'relationTargetFieldMetadataId' | 'relationAggregateOperation'
      >;
      fieldMetadataItem: FieldMetadataItem;
    }) =>
      isLookupColumnsEnabled
        ? getRecordFieldAggregateTarget({
            recordField,
            fieldMetadataItem,
            objectMetadataItems,
          })
        : undefined,
    [isLookupColumnsEnabled, objectMetadataItems],
  );
};
