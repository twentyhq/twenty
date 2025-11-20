import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { DateAggregateOperations } from '@/object-record/record-table/constants/DateAggregateOperations';
import { enUS } from 'date-fns/locale';
import { findByProperty } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getMockCompanyObjectMetadataItem } from '~/testing/mock-data/companies';

describe('transformAggregateRawValueIntoAggregateDisplayValue', () => {
  const mockCompanyObjectMetadataItem = getMockCompanyObjectMetadataItem();
  const mockCompanyEmployeesFieldMetadataItem =
    mockCompanyObjectMetadataItem.fields.find(
      findByProperty('name', 'employees'),
    );

  it('should return correct display value for avg of employees', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockCompanyEmployeesFieldMetadataItem,
        aggregateOperation: AggregateOperations.AVG,
        aggregateRawValue: 300,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('300');
  });

  it('should return correct display value for COUNT', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: undefined,
        aggregateOperation: AggregateOperations.COUNT,
        aggregateRawValue: 4,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('4');
  });

  it('should return "-" for nullish aggregate raw value', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: undefined,
        aggregateOperation: AggregateOperations.SUM,
        aggregateRawValue: undefined,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('-');
  });

  it('should return "-" for operation other than COUNT with an undefined field metadata item', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: undefined,
        aggregateOperation: AggregateOperations.SUM,
        aggregateRawValue: 3,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('-');
  });

  it('should return correct percentage formatted value', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockCompanyEmployeesFieldMetadataItem,
        aggregateOperation: AggregateOperations.PERCENTAGE_EMPTY,
        aggregateRawValue: 0.09,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('9%');
  });

  it('should return correct currency formatted value from amount micro', () => {
    const mockCurrencyFieldMetadataItem = {
      ...mockCompanyEmployeesFieldMetadataItem,
      type: FieldMetadataType.CURRENCY,
    } as FieldMetadataItem;

    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockCurrencyFieldMetadataItem,
        aggregateOperation: AggregateOperations.SUM,
        aggregateRawValue: 230440000000,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('230.4k');
  });

  it('should return correct number formatted value', () => {
    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockCompanyEmployeesFieldMetadataItem,
        aggregateOperation: AggregateOperations.SUM,
        aggregateRawValue: 100000000,
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('100,000,000');
  });

  it('should return correct DATE formatted value', () => {
    const mockDateFieldMetadataItem = {
      ...mockCompanyEmployeesFieldMetadataItem,
      type: FieldMetadataType.DATE,
      settings: undefined,
    } as FieldMetadataItem;

    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockDateFieldMetadataItem,
        aggregateOperation: DateAggregateOperations.EARLIEST,
        aggregateRawValue: '2000-01-01',
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('1 Jan, 2000');
  });

  it('should return correct DATE_TIME formatted value', () => {
    const mockDateFieldMetadataItem = {
      ...mockCompanyEmployeesFieldMetadataItem,
      type: FieldMetadataType.DATE_TIME,
      settings: undefined,
    } as FieldMetadataItem;

    expect(
      transformAggregateRawValueIntoAggregateDisplayValue({
        aggregateFieldMetadataItem: mockDateFieldMetadataItem,
        aggregateOperation: DateAggregateOperations.EARLIEST,
        aggregateRawValue: '2000-01-01T12:00:00.000Z',
        dateFormat: DateFormat.DAY_FIRST,
        timeFormat: TimeFormat.HOUR_24,
        localeCatalog: enUS,
        timeZone: 'UTC',
      }),
    ).toBe('1 Jan, 2000 12:00');
  });
});
