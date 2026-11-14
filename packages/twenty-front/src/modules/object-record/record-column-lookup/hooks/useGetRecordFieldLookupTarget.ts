import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type GetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/types/GetRecordFieldLookupTarget';
import { getRecordFieldLookupTarget } from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

// With the flag off a lookup column renders, loads and aggregates as its plain relation
export const useGetRecordFieldLookupTarget = (): GetRecordFieldLookupTarget => {
  const isColumnSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COLUMN_SETTINGS_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();

  return useCallback(
    ({ recordField, fieldMetadataItem }) =>
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
