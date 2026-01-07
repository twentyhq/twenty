import { formatPrimaryDimensionValues } from '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';

jest.mock('@/page-layout/widgets/graph/utils/formatDimensionValue', () => ({
  formatDimensionValue: jest.fn((args: { value: unknown }) => {
    return `formatted-${String(args.value)}`;
  }),
}));

const { formatDimensionValue } = jest.requireMock(
  '@/page-layout/widgets/graph/utils/formatDimensionValue',
) as { formatDimensionValue: jest.Mock };

const userTimezone = 'Europe/Paris';

describe('formatPrimaryDimensionValues', () => {
  it('includes buckets where the primary dimension value is null', () => {
    const result = formatPrimaryDimensionValues({
      groupByRawResults: [
        { groupByDimensionValues: [null] },
        { groupByDimensionValues: ['Active'] },
      ],
      primaryAxisGroupByField: {
        name: 'status',
        type: FieldMetadataType.TEXT,
      } as any,
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(result).toHaveLength(2);
    expect(result[0].rawPrimaryDimensionValue).toBeNull();
    expect(result[0].formattedPrimaryDimensionValue).toBe('formatted-null');
    expect(result[1].formattedPrimaryDimensionValue).toBe('formatted-Active');
  });

  it('passes granularity and subfield to the formatter', () => {
    formatDimensionValue.mockClear();

    formatPrimaryDimensionValues({
      groupByRawResults: [
        { groupByDimensionValues: ['2024-01-15T00:00:00.000Z'] },
      ],
      primaryAxisGroupByField: {
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
      } as any,
      primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      primaryAxisGroupBySubFieldName: 'createdAt',
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(formatDimensionValue).toHaveBeenCalledWith({
      value: '2024-01-15T00:00:00.000Z',
      fieldMetadata: expect.objectContaining({
        name: 'createdAt',
        type: FieldMetadataType.DATE_TIME,
      }),
      dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      subFieldName: 'createdAt',
      userTimezone: 'Europe/Paris',
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });
  });
});
