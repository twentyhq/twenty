import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';
import { FieldMetadataType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';

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

// TODO: we would need to refactor the typing of SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS first
//   with types like FieldCurrencyValue being derived from a central constant value and not being created like that
//   in order to narrow down the possible subfield names for each field type
type CompositeFieldFilterOperandMap = {
  [K in FilterableFieldType]: Partial<{
    [S in CompositeFieldSubFieldName]: readonly RecordFilterOperand[];
  }>;
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

export const COMPOSITE_FIELD_FILTER_OPERANDS_MAP = {
  CURRENCY: {
    currencyCode: [
      RecordFilterOperand.Is,
      RecordFilterOperand.IsNot,
      ...emptyOperands,
    ],
    amountMicros: [
      RecordFilterOperand.GreaterThan,
      RecordFilterOperand.LessThan,
      RecordFilterOperand.Is,
      RecordFilterOperand.IsNot,
      ...emptyOperands,
    ],
  },
} as const satisfies Partial<CompositeFieldFilterOperandMap>;

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
    case 'CURRENCY': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          subFieldName,
        )
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.currencyCode;
      } else if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'amountMicros',
          subFieldName,
        )
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.CURRENCY.amountMicros;
      } else {
        throw new Error(
          `Unknown subfield name ${subFieldName} for ${filterType} filter`,
        );
      }
    }
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
      assertUnreachable(filterType, `Unknown filter type ${filterType}`);
  }
};
