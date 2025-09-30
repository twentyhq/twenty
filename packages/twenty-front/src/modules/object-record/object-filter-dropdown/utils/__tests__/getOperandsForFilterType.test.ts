import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type FilterableFieldType } from 'twenty-shared/types';

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
    RecordFilterOperand.GreaterThanOrEqual,
    RecordFilterOperand.LessThanOrEqual,
  ];

  const currencyAmountMicrosOperands = [
    RecordFilterOperand.GreaterThanOrEqual,
    RecordFilterOperand.LessThanOrEqual,
    RecordFilterOperand.Is,
    RecordFilterOperand.IsNot,
  ];

  const currencyCurrencyCodeOperands = [
    RecordFilterOperand.Is,
    RecordFilterOperand.IsNot,
  ];

  const actorSourceOperands = [
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
    ['LINKS', [...containsOperands, ...emptyOperands], 'primaryLinkUrl'],
    ['LINKS', [...containsOperands, ...emptyOperands], 'primaryLinkLabel'],
    ['LINKS', [...containsOperands, ...emptyOperands], 'secondaryLinks'],
    ['ACTOR', [...containsOperands, ...emptyOperands], 'name'],
    ['ACTOR', [...actorSourceOperands, ...emptyOperands], 'source'],
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
  ] satisfies (
    | [FieldType, RecordFilterOperand[], CompositeFieldSubFieldName]
    | [FieldType, RecordFilterOperand[]]
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
