import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AggregateRecordsData } from '@/object-record/hooks/useAggregateRecords';
import { computeAggregateValueAndLabel } from '@/object-record/record-board/record-board-column/utils/computeAggregateValueAndLabel';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { DATE_AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/DateAggregateOperations';
import { FieldMetadataType } from '~/generated/graphql';

const MOCK_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const MOCK_KANBAN_FIELD_NAME = 'stage';

describe('computeAggregateValueAndLabel', () => {
  const mockObjectMetadata: ObjectMetadataItem = {
    id: '123',
    fields: [
      {
        id: MOCK_FIELD_ID,
        name: 'amount',
        label: 'amount',
        type: FieldMetadataType.Currency,
      } as FieldMetadataItem,
    ],
  } as ObjectMetadataItem;

  const defaultParams = {
    dateFormat: DateFormat.DAY_FIRST,
    timeFormat: TimeFormat.HOUR_24,
    timeZone: 'UTC',
  };

  it('should return empty object for empty data', () => {
    const result = computeAggregateValueAndLabel({
      data: {} as AggregateRecordsData,
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({});
  });

  it('should handle currency field with division by 1M', () => {
    const mockData = {
      amount: {
        [AGGREGATE_OPERATIONS.sum]: 2000000,
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: '2',
      label: 'Sum',
      labelWithFieldName: 'Sum of amount',
    });
  });

  it('should handle number field as percentage', () => {
    const mockObjectMetadataWithPercentageField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'percentage',
          label: 'percentage',
          type: FieldMetadataType.Number,
          settings: {
            type: 'percentage',
          },
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockData = {
      percentage: {
        [AGGREGATE_OPERATIONS.avg]: 0.3,
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadataWithPercentageField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.avg,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: '30%',
      label: 'Average',
      labelWithFieldName: 'Average of percentage',
    });
  });

  it('should handle number field with decimals', () => {
    const mockObjectMetadataWithDecimalsField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'decimals',
          label: 'decimals',
          type: FieldMetadataType.Number,
          settings: {
            decimals: 2,
          },
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockData = {
      decimals: {
        [AGGREGATE_OPERATIONS.sum]: 0.009,
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadataWithDecimalsField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: '0.01',
      label: 'Sum',
      labelWithFieldName: 'Sum of decimals',
    });
  });

  it('should handle datetime field with min operation', () => {
    const mockObjectMetadataWithDatetimeField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'createdAt',
          label: 'Created At',
          type: FieldMetadataType.DateTime,
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockFormattedData = {
      createdAt: {
        [DATE_AGGREGATE_OPERATIONS.earliest]: '2023-01-01T12:00:00Z',
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockFormattedData,
      objectMetadataItem: mockObjectMetadataWithDatetimeField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: DATE_AGGREGATE_OPERATIONS.earliest,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      label: 'Earliest',
      labelWithFieldName: 'Earliest date of Created At',
      value: '1 Jan, 2023 12:00',
    });
  });

  it('should handle datetime field with max operation', () => {
    const mockObjectMetadataWithDatetimeField: ObjectMetadataItem = {
      id: '123',
      fields: [
        {
          id: MOCK_FIELD_ID,
          name: 'updatedAt',
          label: 'Updated At',
          type: FieldMetadataType.DateTime,
        } as FieldMetadataItem,
      ],
    } as ObjectMetadataItem;

    const mockFormattedData = {
      updatedAt: {
        [DATE_AGGREGATE_OPERATIONS.latest]: '2023-12-31T23:59:59Z',
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockFormattedData,
      objectMetadataItem: mockObjectMetadataWithDatetimeField,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: DATE_AGGREGATE_OPERATIONS.latest,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: '31 Dec, 2023 23:59',
      label: 'Latest',
      labelWithFieldName: 'Latest date of Updated At',
    });
  });

  it('should default to count when field not found', () => {
    const mockData = {
      [MOCK_KANBAN_FIELD_NAME]: {
        [AGGREGATE_OPERATIONS.count]: 42,
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fallbackFieldName: MOCK_KANBAN_FIELD_NAME,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: 42,
      label: 'Count all',
      labelWithFieldName: 'Count all',
    });
  });

  it('should handle undefined aggregate value', () => {
    const mockData = {
      amount: {
        [AGGREGATE_OPERATIONS.sum]: undefined,
      },
    } as AggregateRecordsData;

    const result = computeAggregateValueAndLabel({
      data: mockData,
      objectMetadataItem: mockObjectMetadata,
      fieldMetadataId: MOCK_FIELD_ID,
      aggregateOperation: AGGREGATE_OPERATIONS.sum,
      ...defaultParams,
    });

    expect(result).toEqual({
      value: '-',
      label: 'Sum',
      labelWithFieldName: 'Sum of amount',
    });
  });
});
