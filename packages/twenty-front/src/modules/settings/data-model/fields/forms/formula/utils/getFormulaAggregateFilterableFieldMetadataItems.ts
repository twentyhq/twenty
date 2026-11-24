import {
  isDefined,
  isQueryTimeFormulaFieldMetadata,
} from 'twenty-shared/utils';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateConditionOperandsByFieldMetadataType';

export const getFormulaAggregateFilterableFieldMetadataItems = <
  TFieldMetadataItem extends Pick<
    FieldMetadataItem,
    'isActive' | 'isSystem' | 'type' | 'settings'
  >,
>(
  fieldMetadataItems: TFieldMetadataItem[],
): TFieldMetadataItem[] =>
  fieldMetadataItems.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.isActive === true &&
      fieldMetadataItem.isSystem !== true &&
      !isQueryTimeFormulaFieldMetadata(fieldMetadataItem) &&
      isDefined(
        FORMULA_AGGREGATE_CONDITION_OPERANDS_BY_FIELD_METADATA_TYPE[
          fieldMetadataItem.type
        ],
      ),
  );
