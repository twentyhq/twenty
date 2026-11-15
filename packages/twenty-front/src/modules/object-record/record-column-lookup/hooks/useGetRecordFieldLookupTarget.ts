import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

// With the flag off a lookup column renders, loads and aggregates as its plain relation
export const useGetRecordFieldLookupTarget = () => {
  const isColumnSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COLUMN_SETTINGS_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  return useCallback(
    ({
      recordField,
      fieldMetadataItem,
    }: {
      recordField: Pick<RecordField, 'relationTargetFieldMetadataId'>;
      fieldMetadataItem: FieldMetadataItem;
    }) =>
      isColumnSettingsEnabled
        ? getRecordFieldLookupTarget({
            recordField,
            fieldMetadataItem,
            objectMetadataItems,
          })
        : undefined,
    [isColumnSettingsEnabled, objectMetadataItems],
  );
};
