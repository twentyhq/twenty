import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { type CompositeFieldSubFieldName } from '@/settings/data-model/types/CompositeFieldSubFieldName';
import { type FieldType } from '@/settings/data-model/types/FieldType';
import { type FilterableFieldType } from 'twenty-shared/types';

describe('getOperandsForFilterType', () => {
  const emptyOperands = [
    RecordFilterOperand.IS_EMPTY,
    RecordFilterOperand.IS_NOT_EMPTY,
  ];

  const containsOperands = [
    RecordFilterOperand.CONTAINS,
    RecordFilterOperand.DOES_NOT_CONTAIN,
  ];

  const numberOperands = [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
    RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    RecordFilterOperand.LESS_THAN_OR_EQUAL,
  ];

  const currencyAmountMicrosOperands = [
    RecordFilterOperand.GREATER_THAN_OR_EQUAL,
    RecordFilterOperand.LESS_THAN_OR_EQUAL,
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
  ];

  const currencyCurrencyCodeOperands = [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
  ];

  const actorSourceOperands = [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_NOT,
  ];

  const dateOperands = [
    RecordFilterOperand.IS,
    RecordFilterOperand.IS_RELATIVE,
    RecordFilterOperand.IS_IN_PAST,
    RecordFilterOperand.IS_IN_FUTURE,
    RecordFilterOperand.IS_TODAY,
    RecordFilterOperand.IS_BEFORE,
    RecordFilterOperand.IS_AFTER,
  ];

  const relationOperand = [RecordFilterOperand.IS, RecordFilterOperand.IS_NOT];

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
