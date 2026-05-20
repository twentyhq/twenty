import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { isFilterOnActorWorkspaceMemberSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorWorkspaceMemberSubField';
import {
  FieldMetadataType,
  ViewFilterOperand as RecordFilterOperand,
  type FilterableAndTSVectorFieldType,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  COMPOSITE_FIELD_FILTER_OPERANDS_MAP,
  FILTER_OPERANDS_MAP,
  isExpectedSubFieldName,
} from 'twenty-shared/utils';

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
}): readonly RecordFilterOperand[] => {
  switch (filterType) {
    case 'TEXT':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'LINKS':
    case 'PHONES':
      return FILTER_OPERANDS_MAP.TEXT;
    case 'CURRENCY': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          subFieldName,
        ) === true
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.currencyCode;
      } else {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.amountMicros;
      }
    }
    case 'NUMBER':
      return FILTER_OPERANDS_MAP.NUMBER;
    case 'RAW_JSON':
      return FILTER_OPERANDS_MAP.RAW_JSON;
    case 'FILES':
      return FILTER_OPERANDS_MAP.FILES;
    case 'DATE_TIME':
    case 'DATE':
      return FILTER_OPERANDS_MAP.DATE_TIME;
    case 'RATING':
      return FILTER_OPERANDS_MAP.RATING;
    case 'RELATION':
      return FILTER_OPERANDS_MAP.RELATION;
    case 'MULTI_SELECT':
      return FILTER_OPERANDS_MAP.MULTI_SELECT;
    case 'SELECT':
      return FILTER_OPERANDS_MAP.SELECT;
    case 'ACTOR': {
      if (
        isFilterOnActorSourceSubField(subFieldName) ||
        isFilterOnActorWorkspaceMemberSubField(subFieldName)
      ) {
        return [
          RecordFilterOperand.IS,
          RecordFilterOperand.IS_NOT,
          RecordFilterOperand.IS_EMPTY,
          RecordFilterOperand.IS_NOT_EMPTY,
        ];
      }

      return FILTER_OPERANDS_MAP.ACTOR;
    }
    case 'ARRAY':
      return FILTER_OPERANDS_MAP.ARRAY;
    case 'BOOLEAN':
      return FILTER_OPERANDS_MAP.BOOLEAN;
    case 'TS_VECTOR':
      return FILTER_OPERANDS_MAP.TS_VECTOR;
    case 'UUID':
      return FILTER_OPERANDS_MAP.UUID;
    default:
      assertUnreachable(filterType, `Unknown filter type ${filterType}`);
  }
};
