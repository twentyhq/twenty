import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getChartValueFormatOptions } from '@/page-layout/widgets/graph/utils/getChartValueFormatOptions';
import { formatGraphValue } from '@/page-layout/widgets/graph/utils/graphFormatters';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  AggregateOperations,
  ChartNumberFormat,
} from '~/generated-metadata/graphql';

describe('getChartValueFormatOptions', () => {
  const aggregateFieldMetadataItem = {
    id: 'score-field-id',
    type: FieldMetadataType.NUMBER,
    settings: {
      decimals: 2,
      type: 'number',
    },
  } as FieldMetadataItem;

  const aggregateCurrencyFieldMetadataItem = {
    id: 'revenue-field-id',
    type: FieldMetadataType.CURRENCY,
  } as FieldMetadataItem;

  it.each([
    AggregateOperations.AVG,
    AggregateOperations.MAX,
    AggregateOperations.MIN,
    AggregateOperations.SUM,
  ])(
    'should honor the aggregate number field decimal setting for %s',
    (aggregateOperation) => {
      const formatOptions = getChartValueFormatOptions({
        aggregateOperation,
        aggregateFieldMetadataId: aggregateFieldMetadataItem.id,
        fieldMetadataItems: [aggregateFieldMetadataItem],
        numberFormat: ChartNumberFormat.FULL,
      });

      expect(formatGraphValue(123.4567, formatOptions)).toBe('123.46');
    },
  );

  it.each([
    AggregateOperations.AVG,
    AggregateOperations.MAX,
    AggregateOperations.MIN,
    AggregateOperations.SUM,
  ])(
    'should format aggregate currency fields with two decimals for %s',
    (aggregateOperation) => {
      const formatOptions = getChartValueFormatOptions({
        aggregateOperation,
        aggregateFieldMetadataId: aggregateCurrencyFieldMetadataItem.id,
        fieldMetadataItems: [aggregateCurrencyFieldMetadataItem],
        numberFormat: ChartNumberFormat.FULL,
      });

      expect(formatGraphValue(123.4567, formatOptions)).toBe('123.46');
    },
  );

  it('should keep the short format compact', () => {
    const formatOptions = getChartValueFormatOptions({
      aggregateOperation: AggregateOperations.SUM,
      aggregateFieldMetadataId: aggregateFieldMetadataItem.id,
      fieldMetadataItems: [aggregateFieldMetadataItem],
      numberFormat: ChartNumberFormat.SHORT,
    });

    expect(formatGraphValue(123.4567, formatOptions)).toBe('123.5');
  });

  it.each([
    AggregateOperations.COUNT,
    AggregateOperations.COUNT_EMPTY,
    AggregateOperations.COUNT_FALSE,
    AggregateOperations.COUNT_NOT_EMPTY,
    AggregateOperations.COUNT_TRUE,
    AggregateOperations.COUNT_UNIQUE_VALUES,
    AggregateOperations.PERCENTAGE_EMPTY,
    AggregateOperations.PERCENTAGE_NOT_EMPTY,
  ])(
    'should ignore the aggregate number field decimal setting for %s',
    (aggregateOperation) => {
      const formatOptions = getChartValueFormatOptions({
        aggregateOperation,
        aggregateFieldMetadataId: aggregateFieldMetadataItem.id,
        fieldMetadataItems: [aggregateFieldMetadataItem],
        numberFormat: ChartNumberFormat.FULL,
      });

      expect(formatOptions.decimals).toBeUndefined();
    },
  );
});
