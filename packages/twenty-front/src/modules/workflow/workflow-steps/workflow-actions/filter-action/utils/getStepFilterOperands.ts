import { ViewFilterOperand } from 'twenty-shared/src/types';

const emptyOperands = [
  ViewFilterOperand.IsEmpty,
  ViewFilterOperand.IsNotEmpty,
] as const;

const relationOperands = [
  ViewFilterOperand.Is,
  ViewFilterOperand.IsNot,
] as const;

const defaultOperands = [
  ViewFilterOperand.Is,
  ViewFilterOperand.IsNot,
  ViewFilterOperand.Contains,
  ViewFilterOperand.DoesNotContain,
  ViewFilterOperand.GreaterThanOrEqual,
  ViewFilterOperand.LessThanOrEqual,
  ...emptyOperands,
] as const;

export const FILTER_OPERANDS_MAP = {
  TEXT: [
    ViewFilterOperand.Contains,
    ViewFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  NUMBER: [
    ViewFilterOperand.GreaterThanOrEqual,
    ViewFilterOperand.LessThanOrEqual,
    ...emptyOperands,
  ],
  RAW_JSON: [
    ViewFilterOperand.Contains,
    ViewFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  DATE_TIME: [
    ViewFilterOperand.Is,
    ViewFilterOperand.IsRelative,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
    ViewFilterOperand.IsBefore,
    ViewFilterOperand.IsAfter,
    ...emptyOperands,
  ],
  DATE: [
    ViewFilterOperand.Is,
    ViewFilterOperand.IsRelative,
    ViewFilterOperand.IsInPast,
    ViewFilterOperand.IsInFuture,
    ViewFilterOperand.IsToday,
    ViewFilterOperand.IsBefore,
    ViewFilterOperand.IsAfter,
    ...emptyOperands,
  ],
  RATING: [ViewFilterOperand.Is, ViewFilterOperand.IsNot, ...emptyOperands],
  RELATION: [...relationOperands, ...emptyOperands],
  MULTI_SELECT: [
    ViewFilterOperand.Contains,
    ViewFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  SELECT: [ViewFilterOperand.Is, ViewFilterOperand.IsNot, ...emptyOperands],
  ARRAY: [
    ViewFilterOperand.Contains,
    ViewFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  BOOLEAN: [ViewFilterOperand.Is],
  UUID: [ViewFilterOperand.Is],
  NUMERIC: [
    ViewFilterOperand.GreaterThanOrEqual,
    ViewFilterOperand.LessThanOrEqual,
    ...emptyOperands,
  ],
};

export const getViewFilterOperands = ({
  filterType,
}: {
  filterType: string;
}): readonly ViewFilterOperand[] => {
  switch (filterType) {
    case 'TEXT':
      return FILTER_OPERANDS_MAP.TEXT;
    case 'NUMBER':
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
      return FILTER_OPERANDS_MAP.ARRAY;
    case 'BOOLEAN':
      return FILTER_OPERANDS_MAP.BOOLEAN;
    case 'UUID':
      return FILTER_OPERANDS_MAP.UUID;
    case 'NUMERIC':
      return FILTER_OPERANDS_MAP.NUMERIC;
    default:
      return defaultOperands;
  }
};
