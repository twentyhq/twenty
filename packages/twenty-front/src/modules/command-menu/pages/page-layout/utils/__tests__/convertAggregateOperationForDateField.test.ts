import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';
import { convertAggregateOperationForDateField } from '@/command-menu/pages/page-layout/utils/convertAggregateOperationForDateField';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from 'twenty-shared/types';
import { TEST_BAR_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';

const createMockObjectMetadataItem = (
  fields: { id: string; type: FieldMetadataType }[],
): ObjectMetadataItem =>
  ({
    id: 'object-1',
    fields: fields.map((f) => ({ ...f, name: 'field' })),
  }) as ObjectMetadataItem;

describe('convertAggregateOperationForDateField', () => {
  it('returns COUNT when date field uses MIN operation', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateFieldMetadataId: 'date-field',
      aggregateOperation: AggregateOperations.MIN,
    };

    const objectMetadataItem = createMockObjectMetadataItem([
      { id: 'date-field', type: FieldMetadataType.DATE },
    ]);

    const result = convertAggregateOperationForDateField(
      config,
      objectMetadataItem,
    );

    expect(result).toBe(AggregateOperations.COUNT);
  });

  it('returns COUNT when datetime field uses MAX operation', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateFieldMetadataId: 'datetime-field',
      aggregateOperation: AggregateOperations.MAX,
    };

    const objectMetadataItem = createMockObjectMetadataItem([
      { id: 'datetime-field', type: FieldMetadataType.DATE_TIME },
    ]);

    const result = convertAggregateOperationForDateField(
      config,
      objectMetadataItem,
    );

    expect(result).toBe(AggregateOperations.COUNT);
  });

  it('returns undefined when field is not a date type', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateFieldMetadataId: 'number-field',
      aggregateOperation: AggregateOperations.MIN,
    };

    const objectMetadataItem = createMockObjectMetadataItem([
      { id: 'number-field', type: FieldMetadataType.NUMBER },
    ]);

    const result = convertAggregateOperationForDateField(
      config,
      objectMetadataItem,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when operation is not MIN or MAX', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateFieldMetadataId: 'date-field',
      aggregateOperation: AggregateOperations.SUM,
    };

    const objectMetadataItem = createMockObjectMetadataItem([
      { id: 'date-field', type: FieldMetadataType.DATE },
    ]);

    const result = convertAggregateOperationForDateField(
      config,
      objectMetadataItem,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when objectMetadataItem is undefined', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateOperation: AggregateOperations.MIN,
    };

    const result = convertAggregateOperationForDateField(config, undefined);

    expect(result).toBeUndefined();
  });

  it('returns undefined when field is not found', () => {
    const config: ChartConfiguration = {
      ...TEST_BAR_CHART_CONFIGURATION,
      aggregateFieldMetadataId: 'missing-field',
      aggregateOperation: AggregateOperations.MIN,
    };

    const objectMetadataItem = createMockObjectMetadataItem([
      { id: 'other-field', type: FieldMetadataType.DATE },
    ]);

    const result = convertAggregateOperationForDateField(
      config,
      objectMetadataItem,
    );

    expect(result).toBeUndefined();
  });
});
