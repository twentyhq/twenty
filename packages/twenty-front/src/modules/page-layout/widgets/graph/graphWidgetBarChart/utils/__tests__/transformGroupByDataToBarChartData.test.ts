import { transformGroupByDataToBarChartData } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformGroupByDataToBarChartData';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import {
  AxisNameDisplay,
  BarChartLayout,
  WidgetConfigurationType,
} from '~/generated/graphql';

jest.mock(
  '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInBarChartData',
  () => ({
    fillDateGapsInBarChartData: jest.fn(({ data }) => ({
      data,
      wasTruncated: true,
    })),
  }),
);

jest.mock(
  '@/page-layout/widgets/graph/graphWidgetBarChart/utils/transformOneDimensionalGroupByToBarChartData',
  () => ({
    transformOneDimensionalGroupByToBarChartData: jest.fn(() => ({
      data: [],
      indexBy: 'x',
      keys: ['value'],
      series: [],
      hasTooManyGroups: false,
      formattedToRawLookup: new Map(),
    })),
  }),
);

jest.mock('@/page-layout/widgets/graph/utils/filterGroupByResults', () => ({
  filterGroupByResults: jest.fn((args) => args.rawResults),
}));

const { fillDateGapsInBarChartData } = jest.requireMock(
  '@/page-layout/widgets/graph/graphWidgetBarChart/utils/fillDateGapsInBarChartData',
) as { fillDateGapsInBarChartData: jest.Mock };

describe('transformGroupByDataToBarChartData', () => {
  const userTimezone = 'Europe/Paris';

  it('fills date gaps when grouping by a relation date subfield with granularity', () => {
    const groupByField = {
      id: 'group-by-field',
      name: 'company',
      type: FieldMetadataType.RELATION,
      relation: { targetObjectMetadata: { nameSingular: 'company' } },
    };

    const aggregateField = {
      id: 'aggregate-field',
      name: 'count',
      type: FieldMetadataType.NUMBER,
    };

    const objectMetadataItem = {
      id: 'obj-1',
      nameSingular: 'company',
      namePlural: 'companies',
      fields: [
        groupByField,
        aggregateField,
        { id: 'createdAt', name: 'createdAt', type: FieldMetadataType.DATE },
      ],
    } as any;

    const objectMetadataItems = [objectMetadataItem];

    const configuration = {
      __typename: 'BarChartConfiguration',
      aggregateFieldMetadataId: aggregateField.id,
      aggregateOperation: 'COUNT',
      configurationType: WidgetConfigurationType.BAR_CHART,
      layout: BarChartLayout.VERTICAL,
      primaryAxisGroupByFieldMetadataId: groupByField.id,
      primaryAxisGroupBySubFieldName: 'createdAt',
      primaryAxisDateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
      axisNameDisplay: AxisNameDisplay.BOTH,
    } as any;

    const groupByData = {
      companiesGroupBy: [
        { groupByDimensionValues: ['2024-01-01T00:00:00.000Z'], COUNT: 1 },
      ],
    };

    fillDateGapsInBarChartData.mockClear();

    const result = transformGroupByDataToBarChartData({
      groupByData,
      objectMetadataItem,
      objectMetadataItems,
      configuration,
      aggregateOperation: 'COUNT',
      userTimezone,
      firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
    });

    expect(fillDateGapsInBarChartData).toHaveBeenCalledTimes(1);
    expect(fillDateGapsInBarChartData).toHaveBeenCalledWith(
      expect.objectContaining({
        dateGranularity: ObjectRecordGroupByDateGranularity.MONTH,
        hasSecondDimension: false,
      }),
    );
    expect(result.hasTooManyGroups).toBe(true);
  });
});
