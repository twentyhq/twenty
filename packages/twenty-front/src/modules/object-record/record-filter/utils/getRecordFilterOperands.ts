import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';

export type GetRecordFilterOperandsParams = {
  filterType: FilterableFieldType;
  subFieldName?: string | null | undefined;
};

const emptyOperands = [
  RecordFilterOperand.IsEmpty,
  RecordFilterOperand.IsNotEmpty,
] as const;

const relationOperands = [
  RecordFilterOperand.Is,
  RecordFilterOperand.IsNot,
] as const;

type FilterOperandMap = {
  [K in FilterableFieldType]: readonly RecordFilterOperand[];
};

export const FILTER_OPERANDS_MAP = {
  TEXT: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  EMAILS: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  FULL_NAME: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  ADDRESS: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  LINKS: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  PHONES: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  CURRENCY: [
    RecordFilterOperand.GreaterThan,
    RecordFilterOperand.LessThan,
    ...emptyOperands,
  ],
  NUMBER: [
    RecordFilterOperand.GreaterThan,
    RecordFilterOperand.LessThan,
    ...emptyOperands,
  ],
  RAW_JSON: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  DATE_TIME: [
    RecordFilterOperand.Is,
    RecordFilterOperand.IsRelative,
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
    RecordFilterOperand.IsBefore,
    RecordFilterOperand.IsAfter,
    ...emptyOperands,
  ],
  DATE: [
    RecordFilterOperand.Is,
    RecordFilterOperand.IsRelative,
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
    RecordFilterOperand.IsBefore,
    RecordFilterOperand.IsAfter,
    ...emptyOperands,
  ],
  RATING: [
    RecordFilterOperand.Is,
    RecordFilterOperand.GreaterThan,
    RecordFilterOperand.LessThan,
    ...emptyOperands,
  ],
  RELATION: [...relationOperands, ...emptyOperands],
  MULTI_SELECT: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  SELECT: [RecordFilterOperand.Is, RecordFilterOperand.IsNot, ...emptyOperands],
  ACTOR: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  ARRAY: [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
    ...emptyOperands,
  ],
  BOOLEAN: [RecordFilterOperand.Is],
} as const satisfies FilterOperandMap;

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: GetRecordFilterOperandsParams) => {
  switch (filterType) {
    case 'TEXT':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'LINKS':
    case 'PHONES':
      return FILTER_OPERANDS_MAP.TEXT;
    case 'CURRENCY':
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
    case 'ACTOR': {
      if (isFilterOnActorSourceSubField(subFieldName)) {
        return [
          RecordFilterOperand.Is,
          RecordFilterOperand.IsNot,
          ...emptyOperands,
        ];
      }

      return FILTER_OPERANDS_MAP.ACTOR;
    }
    case 'ARRAY':
      return FILTER_OPERANDS_MAP.ARRAY;
    case 'BOOLEAN':
      return FILTER_OPERANDS_MAP.BOOLEAN;
    default:
      return [];
  }
};
