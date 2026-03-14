import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { isFilterOnActorWorkspaceMemberSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorWorkspaceMemberSubField';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import {
  FieldMetadataType,
  ViewFilterOperand as RecordFilterOperand,
  type FilterableAndTSVectorFieldType,
  type FilterableFieldType,
} from 'twenty-shared/types';
import {
  assertUnreachable,
  isDefined,
  isExpectedSubFieldName,
} from 'twenty-shared/utils';

export type GetRecordFilterOperandsParams = {
  filterType: FilterableAndTSVectorFieldType;
  subFieldName?: string | null | undefined;
};

const emptyOperands = [
  RecordFilterOperand.IS_EMPTY,
  RecordFilterOperand.IS_NOT_EMPTY,
] as const;

const relationOperands = [
  RecordFilterOperand.IS,
  RecordFilterOperand.IS_NOT,
] as const;

type FilterOperandMap = {
  [K in FilterableAndTSVectorFieldType]: readonly RecordFilterOperand[];
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
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  EMAILS: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  FULL_NAME: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  ADDRESS: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  LINKS: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  PHONES: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  CURRENCY: [
    RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    RecordFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  NUMBER: [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    RecordFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  RAW_JSON: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  FILES: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  DATE_TIME: [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_RELATIVE,
    RecordFilterOperand.IS_IN_PAST,
    RecordFilterOperand.IS_IN_FUTURE,
    RecordFilterOperand.IS_TODAY,
    RecordFilterOperand.IS_BEFORE,
    RecordFilterOperand.IS_AFTER,
    ...emptyOperands,
  ],
  DATE: [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_RELATIVE,
    RecordFilterOperand.IS_IN_PAST,
    RecordFilterOperand.IS_IN_FUTURE,
    RecordFilterOperand.IS_TODAY,
    RecordFilterOperand.IS_BEFORE,
    RecordFilterOperand.IS_AFTER,
    ...emptyOperands,
  ],
  RATING: [
    RecordFilterOperand.IS,
    RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    RecordFilterOperand.LESS_THAN_OR_EQUAL,
    ...emptyOperands,
  ],
  RELATION: [...relationOperands, ...emptyOperands],
  MULTI_SELECT: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  SELECT: [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    ...emptyOperands,
  ],
  ACTOR: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  ARRAY: [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
    ...emptyOperands,
  ],
  BOOLEAN: [RecordFilterOperand.IS],
  TS_VECTOR: [RecordFilterOperand.VECTOR_SEARCH],
  UUID: [RecordFilterOperand.IS],
} as const satisfies FilterOperandMap;

export const COMPOSITE_FIELD_FILTER_OPERANDS_MAP = {
  CURRENCY: {
    currencyCode: [
      RecordFilterOperand.IS,
      RecordFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
    amountMicros: [
      RecordFilterOperand.GREATER_THAN_OR_EQUAL,
      RecordFilterOperand.LESS_THAN_OR_EQUAL,
      RecordFilterOperand.IS,
      RecordFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
  },
  PHONES: {
    primaryPhoneNumber: [
      RecordFilterOperand.CONTAINS,
      RecordFilterOperand.DOES_NOT_CONTAIN,
      RecordFilterOperand.IS,
      RecordFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
  },
  EMAILS: {
    primaryEmail: [
      RecordFilterOperand.CONTAINS,
      RecordFilterOperand.DOES_NOT_CONTAIN,
      RecordFilterOperand.IS,
      RecordFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
  },
  LINKS: {
    primaryLinkUrl: [
      RecordFilterOperand.CONTAINS,
      RecordFilterOperand.DOES_NOT_CONTAIN,
      RecordFilterOperand.IS,
      RecordFilterOperand.IS_NOT,
      ...emptyOperands,
    ],
  },
} as const satisfies Partial<CompositeFieldFilterOperandMap>;

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: GetRecordFilterOperandsParams): readonly RecordFilterOperand[] => {
  switch (filterType) {
    case 'TEXT':
      return FILTER_OPERANDS_MAP.TEXT;
    case 'EMAILS': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.EMAILS,
          'primaryEmail',
          subFieldName,
        ) === true
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.EMAILS.primaryEmail;
      }
      if (isDefined(subFieldName)) {
        return [
          RecordFilterOperand.CONTAINS,
          RecordFilterOperand.DOES_NOT_CONTAIN,
          ...emptyOperands,
        ] as const;
      }
      return FILTER_OPERANDS_MAP.EMAILS;
    }
    case 'FULL_NAME':
      return FILTER_OPERANDS_MAP.FULL_NAME;
    case 'ADDRESS':
      return FILTER_OPERANDS_MAP.ADDRESS;
    case 'LINKS': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.LINKS,
          'primaryLinkUrl',
          subFieldName,
        ) === true
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.LINKS.primaryLinkUrl;
      }
      if (isDefined(subFieldName)) {
        return [
          RecordFilterOperand.CONTAINS,
          RecordFilterOperand.DOES_NOT_CONTAIN,
          ...emptyOperands,
        ] as const;
      }
      return FILTER_OPERANDS_MAP.LINKS;
    }
    case 'PHONES': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.PHONES,
          'primaryPhoneNumber',
          subFieldName,
        ) === true
      ) {
        return COMPOSITE_FIELD_FILTER_OPERANDS_MAP.PHONES.primaryPhoneNumber;
      }
      if (isDefined(subFieldName)) {
        return [
          RecordFilterOperand.CONTAINS,
          RecordFilterOperand.DOES_NOT_CONTAIN,
          ...emptyOperands,
        ] as const;
      }
      return FILTER_OPERANDS_MAP.PHONES;
    }
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
          ...emptyOperands,
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
