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
} as const;

FILTER_OPERANDS_MAP as FilterOperandMap;

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: GetRecordFilterOperandsParams) => {
  const emptyOperands = [
    RecordFilterOperand.IsEmpty,
    RecordFilterOperand.IsNotEmpty,
  ];

  const relationOperands = [RecordFilterOperand.Is, RecordFilterOperand.IsNot];

  switch (filterType) {
    case 'TEXT':
    case 'EMAILS':
    case 'FULL_NAME':
    case 'ADDRESS':
    case 'LINKS':
    case 'PHONES':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ] as const;
    case 'CURRENCY':
    case 'NUMBER':
      return [
        RecordFilterOperand.GreaterThan,
        RecordFilterOperand.LessThan,
        ...emptyOperands,
      ];
    case 'RAW_JSON':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'DATE_TIME':
    case 'DATE':
      return [
        RecordFilterOperand.Is,
        RecordFilterOperand.IsRelative,
        RecordFilterOperand.IsInPast,
        RecordFilterOperand.IsInFuture,
        RecordFilterOperand.IsToday,
        RecordFilterOperand.IsBefore,
        RecordFilterOperand.IsAfter,
        ...emptyOperands,
      ];
    case 'RATING':
      return [
        RecordFilterOperand.Is,
        RecordFilterOperand.GreaterThan,
        RecordFilterOperand.LessThan,
        ...emptyOperands,
      ];
    case 'RELATION':
      return [...relationOperands, ...emptyOperands];
    case 'MULTI_SELECT':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'SELECT':
      return [
        RecordFilterOperand.Is,
        RecordFilterOperand.IsNot,
        ...emptyOperands,
      ];
    case 'ACTOR': {
      if (isFilterOnActorSourceSubField(subFieldName)) {
        return [
          RecordFilterOperand.Is,
          RecordFilterOperand.IsNot,
          ...emptyOperands,
        ];
      }

      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    }
    case 'ARRAY':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ];
    case 'BOOLEAN':
      return [RecordFilterOperand.Is];
    default:
      return [];
  }
};
