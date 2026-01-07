import { GRAPH_DEFAULT_COLOR } from '@/page-layout/widgets/graph/constants/GraphDefaultColor.constant';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { transformGroupByDataToPieChartData } from '@/page-layout/widgets/graph/graphWidgetPieChart/utils/transformGroupByDataToPieChartData';
import { FirstDayOfTheWeek } from 'twenty-shared/types';
import {
  AggregateOperations,
  FieldMetadataType,
} from '~/generated-metadata/graphql';
import {
  WidgetConfigurationType,
  type PieChartConfiguration,
} from '~/generated/graphql';

jest.mock(
  '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues',
  () => ({
    formatPrimaryDimensionValues: jest.fn(),
  }),
);

const { formatPrimaryDimensionValues } = jest.requireMock(
  '@/page-layout/widgets/graph/utils/formatPrimaryDimensionValues',
) as { formatPrimaryDimensionValues: jest.Mock };

describe('transformGroupByDataToPieChartData', () => {
  const userTimezone = 'Europe/Paris';
  it('keeps null group buckets aligned with their aggregate values', () => {
    const groupByField = {
      id: 'group-by-field',
      name: 'status',
      type: FieldMetadataType.TEXT,
      label: 'Status',
    };

    const aggregateField = {
      id: 'aggregate-field',
      name: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
    };

    const objectMetadataItem = {
      id: 'obj-1',
      nameSingular: 'company',
      namePlural: 'companies',
      fields: [groupByField, aggregateField],
    } as any;

    const configuration = {
      __typename: 'PieChartConfiguration',
      aggregateFieldMetadataId: aggregateField.id,
      aggregateOperation: AggregateOperations.COUNT,
      configurationType: WidgetConfigurationType.PIE_CHART,
      groupByFieldMetadataId: groupByField.id,
      displayLegend: true,
    } as PieChartConfiguration;

    const groupByData = {
      companiesGroupBy: [
        { groupByDimensionValues: [null], COUNT: 2 },
        { groupByDimensionValues: ['Active'], COUNT: 5 },
      ],
    };

    formatPrimaryDimensionValues.mockReturnValue([
      {
        formattedPrimaryDimensionValue: 'Not Set',
        rawPrimaryDimensionValue: null,
      },
      {
        formattedPrimaryDimensionValue: 'Active',
        rawPrimaryDimensionValue: 'Active',
      },
    ]);

    const result = transformGroupByDataToPieChartData({
      groupByData,
      objectMetadataItem,
      configuration,
      aggregateOperation: 'COUNT',
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(result.data).toEqual([
      { id: 'Not Set', value: 2, color: GRAPH_DEFAULT_COLOR },
      { id: 'Active', value: 5, color: GRAPH_DEFAULT_COLOR },
    ]);
    expect(result.formattedToRawLookup.get('Not Set')).toBeNull();
    expect(result.formattedToRawLookup.get('Active')).toBe('Active');
    expect(result.hasTooManyGroups).toBe(false);
  });

  it('honors color configuration, hides legend, and flags too many groups', () => {
    const groupByField = {
      id: 'group-by-field',
      name: 'status',
      type: FieldMetadataType.TEXT,
      label: 'Status',
    };

    const aggregateField = {
      id: 'aggregate-field',
      name: 'id',
      type: FieldMetadataType.UUID,
      label: 'Id',
    };

    const objectMetadataItem = {
      id: 'obj-1',
      nameSingular: 'company',
      namePlural: 'companies',
      fields: [groupByField, aggregateField],
    } as any;

    const configuration = {
      __typename: 'PieChartConfiguration',
      aggregateFieldMetadataId: aggregateField.id,
      aggregateOperation: AggregateOperations.COUNT,
      configurationType: WidgetConfigurationType.PIE_CHART,
      groupByFieldMetadataId: groupByField.id,
      displayLegend: false,
      color: 'red',
    } as PieChartConfiguration;

    const totalResults = PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + 1;
    const groupByData = {
      companiesGroupBy: Array.from({ length: totalResults }).map(
        (_unused, index) => ({
          groupByDimensionValues: [`Group ${index}`],
          COUNT: index + 1,
        }),
      ),
    };

    formatPrimaryDimensionValues.mockReturnValue(
      Array.from({ length: totalResults }).map((_unused, index) => ({
        formattedPrimaryDimensionValue: `Group ${index}`,
        rawPrimaryDimensionValue: `Group ${index}`,
      })),
    );

    const result = transformGroupByDataToPieChartData({
      groupByData,
      objectMetadataItem,
      configuration,
      aggregateOperation: 'COUNT',
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(result.showLegend).toBe(false);
    expect(result.hasTooManyGroups).toBe(true);
    expect(result.data).toHaveLength(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES);
    expect(result.data[0]).toEqual({
      id: 'Group 0',
      value: 1,
      color: 'red',
    });
  });
});
