import { isCompositeFilterableFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFilterableFieldType';
import { CompositeFilterableFieldType } from '@/object-record/record-filter/types/CompositeFilterableFieldType';
import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { FieldType } from '@/settings/data-model/types/FieldType';
import { assertUnreachable } from 'twenty-shared/utils';

export const getDefaultSubFieldNameForCompositeFilterableFieldType = (
  fieldType: FieldType,
): CompositeFieldSubFieldName | undefined => {
  if (!isCompositeFilterableFieldType(fieldType as any)) {
    return undefined;
  }

  const compositeFieldType = fieldType as CompositeFilterableFieldType;

  switch (compositeFieldType) {
    case 'CURRENCY':
      return 'amountMicros';
    case 'LINKS':
      return undefined;
    case 'PHONES':
      return undefined;
    case 'EMAILS':
      return undefined;
    case 'ADDRESS':
      return undefined;
    case 'ACTOR':
      return 'source';
    case 'FULL_NAME':
      return undefined;
    default:
      assertUnreachable(compositeFieldType);
  }
};
