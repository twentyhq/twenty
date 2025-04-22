import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';

export type GetRecordFilterOperandsParams = {
  filterType: FilterableFieldType;
  subFieldName?: string | null | undefined;
};

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
      ] as const;
    case 'RAW_JSON':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ] as const;
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
      ] as const;
    case 'RATING':
      return [
        RecordFilterOperand.Is,
        RecordFilterOperand.GreaterThan,
        RecordFilterOperand.LessThan,
        ...emptyOperands,
      ] as const;
    case 'RELATION':
      return [...relationOperands, ...emptyOperands] as const;
    case 'MULTI_SELECT':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ] as const;
    case 'SELECT':
      return [
        RecordFilterOperand.Is,
        RecordFilterOperand.IsNot,
        ...emptyOperands,
      ] as const;
    case 'ACTOR': {
      if (isFilterOnActorSourceSubField(subFieldName)) {
        return [
          RecordFilterOperand.Is,
          RecordFilterOperand.IsNot,
          ...emptyOperands,
        ] as const;
      }

      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ] as const;
    }
    case 'ARRAY':
      return [
        RecordFilterOperand.Contains,
        RecordFilterOperand.DoesNotContain,
        ...emptyOperands,
      ] as const;
    case 'BOOLEAN':
      return [RecordFilterOperand.Is] as const;
    default:
      return [];
  }
};
