import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/rollup/constants/RollupFilterOperandsByFieldMetadataType';
import { getFieldMetadataValueType, isDefined } from 'twenty-shared/utils';

export const getRollupFilterableFieldMetadataItems = (
  fieldMetadataItems: FieldMetadataItem[],
): FieldMetadataItem[] =>
  fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.isSystem !== true &&
      isDefined(
        ROLLUP_FILTER_OPERANDS_BY_FIELD_METADATA_TYPE[
          getFieldMetadataValueType(fieldMetadataItem)
        ],
      ),
  );
