import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperandsForRecordFilterDefinition } from '../../../record-filter/utils/getRecordFilterOperandsForRecordFilterDefinition';

describe('getOperandsForFilterType', () => {
  const emptyOperands = [
    RecordFilterOperand.IsEmpty,
    RecordFilterOperand.IsNotEmpty,
  ];

  const containsOperands = [
    RecordFilterOperand.Contains,
    RecordFilterOperand.DoesNotContain,
  ];

  const numberOperands = [
    RecordFilterOperand.GreaterThan,
    RecordFilterOperand.LessThan,
  ];

  const dateOperands = [
    RecordFilterOperand.Is,
    RecordFilterOperand.IsRelative,
    RecordFilterOperand.IsInPast,
    RecordFilterOperand.IsInFuture,
    RecordFilterOperand.IsToday,
    RecordFilterOperand.IsBefore,
    RecordFilterOperand.IsAfter,
  ];

  const relationOperand = [RecordFilterOperand.Is, RecordFilterOperand.IsNot];

  const testCases = [
    ['TEXT', [...containsOperands, ...emptyOperands]],
    ['FULL_NAME', [...containsOperands, ...emptyOperands]],
    ['ADDRESS', [...containsOperands, ...emptyOperands]],
    ['LINKS', [...containsOperands, ...emptyOperands]],
    ['ACTOR', [...containsOperands, ...emptyOperands]],
    ['CURRENCY', [...numberOperands, ...emptyOperands]],
    ['NUMBER', [...numberOperands, ...emptyOperands]],
    ['DATE', [...dateOperands, ...emptyOperands]],
    ['DATE_TIME', [...dateOperands, ...emptyOperands]],
    ['RELATION', [...relationOperand, ...emptyOperands]],
    [undefined, []],
    [null, []],
    ['UNKNOWN_TYPE', []],
  ];

  testCases.forEach(([filterType, expectedOperands]) => {
    it(`should return correct operands for FilterType.${filterType}`, () => {
      const result = getRecordFilterOperandsForRecordFilterDefinition({
        type: filterType as FilterableFieldType,
      } as RecordFilterDefinition);
      expect(result).toEqual(expectedOperands);
    });
  });
});
