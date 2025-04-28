import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { FieldType } from '@/settings/data-model/types/FieldType';

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

  const currencyAmountMicrosOperands = [
    RecordFilterOperand.GreaterThan,
    RecordFilterOperand.LessThan,
    RecordFilterOperand.Is,
    RecordFilterOperand.IsNot,
  ];

  const currencyCurrencyCodeOperands = [
    RecordFilterOperand.Is,
    RecordFilterOperand.IsNot,
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
    [
      'CURRENCY',
      [...currencyCurrencyCodeOperands, ...emptyOperands],
      'currencyCode',
    ],
    [
      'CURRENCY',
      [...currencyAmountMicrosOperands, ...emptyOperands],
      'amountMicros',
    ],
    ['NUMBER', [...numberOperands, ...emptyOperands]],
    ['DATE', [...dateOperands, ...emptyOperands]],
    ['DATE_TIME', [...dateOperands, ...emptyOperands]],
    ['RELATION', [...relationOperand, ...emptyOperands]],
    [undefined, []],
    [null, []],
    ['UNKNOWN_TYPE', []],
  ] satisfies (
    | [
        FieldType | null | undefined | 'UNKNOWN_TYPE',
        RecordFilterOperand[],
        CompositeFieldSubFieldName,
      ]
    | [FieldType | null | undefined | 'UNKNOWN_TYPE', RecordFilterOperand[]]
  )[];

  testCases.forEach(([filterType, expectedOperands, subFieldName]) => {
    it(`should return correct operands for FilterType.${filterType}`, () => {
      const result = getRecordFilterOperands({
        filterType: filterType as FilterableFieldType,
        subFieldName,
      });
      expect(result).toEqual(expectedOperands);
    });
  });
});
