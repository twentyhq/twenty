import { isActorSourceCompositeFilter } from '@/object-record/object-filter-dropdown/utils/isActorSourceCompositeFilter';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';

export const getRecordFilterOperandsForRecordFilterDefinition = (
  filterDefinition: Pick<RecordFilterDefinition, 'type' | 'compositeFieldName'>,
): RecordFilterOperand[] => {
  const emptyOperands = [
    RecordFilterOperand.IsEmpty,
    RecordFilterOperand.IsNotEmpty,
  ];

  const relationOperands = [RecordFilterOperand.Is, RecordFilterOperand.IsNot];

  switch (filterDefinition.type) {
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
      ];
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
      if (isActorSourceCompositeFilter(filterDefinition)) {
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
