import { ViewFilterOperand } from 'twenty-shared/types';
import {
  COMPOSITE_FIELD_FILTER_OPERANDS_MAP,
  FILTER_OPERANDS_MAP,
} from 'twenty-shared/utils';

const defaultOperands = [
  ViewFilterOperand.IS,
  ViewFilterOperand.IS_NOT,
  ViewFilterOperand.CONTAINS,
  ViewFilterOperand.DOES_NOT_CONTAIN,
  ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  ViewFilterOperand.LESS_THAN_OR_EQUAL,
  ViewFilterOperand.IS_EMPTY,
  ViewFilterOperand.IS_NOT_EMPTY,
] as const;

export const getStepFilterOperands = ({
  filterType,
  subFieldName,
}: {
  filterType: string | undefined;
  subFieldName: string | undefined;
}): readonly ViewFilterOperand[] => {
  switch (filterType) {
    case 'TEXT':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'LINKS':
    case 'PHONES':
      return FILTER_OPERANDS_MAP.TEXT;
    case 'CURRENCY': {
      if (subFieldName === 'currencyCode') {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.currencyCode;
      } else {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.amountMicros;
      }
    }
    case 'NUMBER':
    case 'number':
      return FILTER_OPERANDS_MAP.NUMBER;
    case 'RAW_JSON':
      return FILTER_OPERANDS_MAP.RAW_JSON;
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
    case 'ARRAY':
    case 'array':
      return FILTER_OPERANDS_MAP.ARRAY;
    case 'BOOLEAN':
    case 'boolean':
      return FILTER_OPERANDS_MAP.BOOLEAN;
    case 'UUID':
      return FILTER_OPERANDS_MAP.UUID;
    case 'NUMERIC':
      return FILTER_OPERANDS_MAP.NUMBER;
    case 'ACTOR': {
      if (subFieldName === 'source') {
        return FILTER_OPERANDS_MAP.SELECT;
      } else if (subFieldName === 'workspaceMemberId') {
        return FILTER_OPERANDS_MAP.RELATION;
      }
      return FILTER_OPERANDS_MAP.TEXT;
    }
    default:
      return defaultOperands;
  }
};
