import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import {
  getRecordFieldLookupTarget,
  type RecordFieldLookupTarget,
} from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { FeatureFlagKey } from 'twenty-shared/types';
import { findById, isDefined } from 'twenty-shared/utils';

type RecordFieldLookupTargetFamilyKey = {
  fieldMetadataItemId: string;
  relationTargetFieldMetadataId: string | null | undefined;
};

// With the flag off a lookup column renders, loads and aggregates as its plain relation
export const recordFieldLookupTargetFamilySelector = createAtomFamilySelector<
  RecordFieldLookupTarget | undefined,
  RecordFieldLookupTargetFamilyKey
>({
  key: 'recordFieldLookupTargetFamilySelector',
  get:
    ({
      fieldMetadataItemId,
      relationTargetFieldMetadataId,
    }: RecordFieldLookupTargetFamilyKey) =>
    ({ get }) => {
      const isLookupColumnsEnabled =
        get(currentWorkspaceState)?.featureFlags?.find(
          (featureFlag) =>
            featureFlag.key === FeatureFlagKey.IS_LOOKUP_COLUMNS_ENABLED,
        )?.value === true;

      if (!isLookupColumnsEnabled || !isDefined(relationTargetFieldMetadataId)) {
        return undefined;
      }

      const fieldMetadataItem = get(flattenedFieldMetadataItemsSelector).find(
        findById(fieldMetadataItemId),
      );

      if (!isDefined(fieldMetadataItem)) {
        return undefined;
      }

      return getRecordFieldLookupTarget({
        recordField: { relationTargetFieldMetadataId },
        fieldMetadataItem,
        objectMetadataItems: get(objectMetadataItemsWithFieldsSelector),
      });
    },
});
