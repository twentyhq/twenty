import { isExpectedSubFieldName } from '@/object-record/object-filter-dropdown/utils/isExpectedSubFieldName';
import { isFilterOnActorSourceSubField } from '@/object-record/object-filter-dropdown/utils/isFilterOnActorSourceSubField';
import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { ViewFilterOperand as RecordFilterOperand } from '@/views/types/ViewFilterOperand';
import { FieldMetadataType } from 'twenty-shared/types';

export type GetRecordFilterOperandsParams = {
  filterType: FilterableFieldType;
  subFieldName?: string | null | undefined;
};

export const getRecordFilterOperands = ({
  filterType,
  subFieldName,
}: GetRecordFilterOperandsParams): RecordFilterOperand[] => {
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
      ];
    case 'CURRENCY': {
      if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'currencyCode',
          subFieldName,
        )
      ) {
        return [
          RecordFilterOperand.Is,
          RecordFilterOperand.IsNot,
          ...emptyOperands,
        ];
      } else if (
        isExpectedSubFieldName(
          FieldMetadataType.CURRENCY,
          'amountMicros',
          subFieldName,
        )
      ) {
        return [
          RecordFilterOperand.GreaterThan,
          RecordFilterOperand.LessThan,
          RecordFilterOperand.Is,
          RecordFilterOperand.IsNot,
          ...emptyOperands,
        ];
      } else {
        throw new Error(
          `Unknown subfield name ${subFieldName} for ${filterType} filter`,
        );
      }
    }
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
