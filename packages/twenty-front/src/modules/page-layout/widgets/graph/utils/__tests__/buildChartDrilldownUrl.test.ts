import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildChartDrilldownUrl } from '@/page-layout/widgets/graph/utils/buildChartDrilldownUrl';
import { buildFilterFromChartBucket } from '@/page-layout/widgets/graph/utils/buildFilterFromChartBucket';
import { buildFilterQueryParams } from '@/page-layout/widgets/graph/utils/buildFilterQueryParams';
import { buildSortsFromChartConfig } from '@/page-layout/widgets/graph/utils/buildSortsFromChartConfig';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import { type BarChartConfiguration } from '~/generated/graphql';

jest.mock('@/page-layout/widgets/graph/utils/buildFilterQueryParams');
jest.mock('@/page-layout/widgets/graph/utils/buildFilterFromChartBucket');
jest.mock('@/page-layout/widgets/graph/utils/buildSortsFromChartConfig');

describe('buildChartDrilldownUrl', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      {
        id: 'primary-field',
        name: 'status',
        type: FieldMetadataType.SELECT,
        label: 'Status',
      },
    ],
  } as ObjectMetadataItem;

  const baseConfig: BarChartConfiguration = {
    primaryAxisGroupByFieldMetadataId: 'primary-field',
  } as BarChartConfiguration;

  const mockBuildFilterQueryParams =
    buildFilterQueryParams as jest.MockedFunction<
      typeof buildFilterQueryParams
    >;
  const mockBuildFilterFromChartBucket =
    buildFilterFromChartBucket as jest.MockedFunction<
      typeof buildFilterFromChartBucket
    >;
  const mockBuildSortsFromChartConfig =
    buildSortsFromChartConfig as jest.MockedFunction<
      typeof buildSortsFromChartConfig
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockBuildFilterQueryParams.mockReturnValue(new URLSearchParams());
    mockBuildFilterFromChartBucket.mockReturnValue([]);
    mockBuildSortsFromChartConfig.mockReturnValue([]);
  });

  it('includes viewId in query params when provided', () => {
    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: baseConfig,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
      viewId: 'index-view-id',
    });

    const urlObject = new URL(`http://localhost${url}`);

    expect(urlObject.pathname).toBe('/objects/opportunities');
    expect(urlObject.searchParams.get('viewId')).toBe('index-view-id');
  });

  it('does not include viewId in query params when not provided', () => {
    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: baseConfig,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
    });

    const urlObject = new URL(`http://localhost${url}`);

    expect(urlObject.pathname).toBe('/objects/opportunities');
    expect(urlObject.searchParams.get('viewId')).toBeNull();
  });

  it('appends filters from configuration.filter via buildFilterQueryParams', () => {
    const configWithFilter: BarChartConfiguration = {
      ...baseConfig,
      filter: {
        recordFilters: [],
        recordFilterGroups: [],
      },
    } as BarChartConfiguration;

    mockBuildFilterQueryParams.mockReturnValue(
      new URLSearchParams(
        'filter[status][IS]=OPEN&filter[name][CONTAINS]=Acme',
      ),
    );

    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: configWithFilter,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
    });

    expect(mockBuildFilterQueryParams).toHaveBeenCalledWith({
      recordFilters: [],
      recordFilterGroups: [],
      objectMetadataItem: mockObjectMetadataItem,
    });

    const urlObject = new URL(`http://localhost${url}`);

    expect(urlObject.searchParams.get('filter[status][IS]')).toBe('OPEN');
    expect(urlObject.searchParams.get('filter[name][CONTAINS]')).toBe('Acme');
  });

  it('appends primary dimension filters from buildFilterFromChartBucket when primary field exists', () => {
    mockBuildFilterFromChartBucket.mockReturnValue([
      {
        fieldName: 'status',
        operand: ViewFilterOperand.IS,
        value: 'OPEN',
      },
      {
        fieldName: 'status',
        operand: ViewFilterOperand.IS_NOT,
        value: 'CLOSED',
      },
    ]);

    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: baseConfig,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
      timezone: 'UTC',
    });

    expect(mockBuildFilterFromChartBucket).toHaveBeenCalledWith({
      fieldMetadataItem: mockObjectMetadataItem.fields[0],
      bucketRawValue: 'OPEN',
      dateGranularity: (baseConfig as BarChartConfiguration)
        .primaryAxisDateGranularity,
      subFieldName: (baseConfig as BarChartConfiguration)
        .primaryAxisGroupBySubFieldName,
      timezone: 'UTC',
    });

    const urlObject = new URL(`http://localhost${url}`);

    expect(
      urlObject.searchParams.get(`filter[status][${ViewFilterOperand.IS}]`),
    ).toBe('OPEN');
    expect(
      urlObject.searchParams.get(`filter[status][${ViewFilterOperand.IS_NOT}]`),
    ).toBe('CLOSED');
  });

  it('appends sorts from buildSortsFromChartConfig', () => {
    mockBuildSortsFromChartConfig.mockReturnValue([
      { fieldName: 'createdAt', direction: 'DESC' },
      { fieldName: 'amount', direction: 'ASC' },
    ]);

    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: baseConfig,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
    });

    expect(mockBuildSortsFromChartConfig).toHaveBeenCalledWith({
      configuration: baseConfig,
      objectMetadataItem: mockObjectMetadataItem,
    });

    const urlObject = new URL(`http://localhost${url}`);

    expect(urlObject.searchParams.get('sort[createdAt]')).toBe('DESC');
    expect(urlObject.searchParams.get('sort[amount]')).toBe('ASC');
  });

  it('does not call buildFilterFromChartBucket when primary field is not found', () => {
    const configWithoutPrimaryField: BarChartConfiguration = {
      ...baseConfig,
      primaryAxisGroupByFieldMetadataId: 'non-existent-field',
    } as BarChartConfiguration;

    const url = buildChartDrilldownUrl({
      objectMetadataItem: mockObjectMetadataItem,
      configuration: configWithoutPrimaryField,
      clickedData: {
        primaryBucketRawValue: 'OPEN',
      },
    });

    expect(mockBuildFilterFromChartBucket).not.toHaveBeenCalled();

    const urlObject = new URL(`http://localhost${url}`);

    expect(
      Array.from(urlObject.searchParams.keys()).some((key) =>
        key.startsWith('filter['),
      ),
    ).toBe(false);
  });
});
