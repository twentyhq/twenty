import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { isLookupColumnsEnabledSelector } from '@/object-record/record-column-lookup/states/isLookupColumnsEnabledSelector';
import {
  getRecordFieldLookupTarget,
  type RecordFieldLookupTarget,
} from '@/object-record/record-column-lookup/utils/getRecordFieldLookupTarget';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';
import { findById, isDefined } from 'twenty-shared/utils';

type RecordFieldLookupTargetFamilyKey = {
  fieldMetadataItemId: string;
  relationTargetFieldMetadataId: string | null | undefined;
};

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
      if (!isDefined(relationTargetFieldMetadataId)) {
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
        isLookupColumnsEnabled: get(isLookupColumnsEnabledSelector),
      });
    },
});
