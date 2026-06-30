import { InMemoryCache } from '@apollo/client';

import { LINE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/lineChartData';
import { PIE_CHART_DATA } from '@/page-layout/widgets/graph/graphql/queries/pieChartData';

// Pie slices and line series are returned with `key` (the bucket label) rather than `id`,
// so Apollo's default id-based normalization never pools them into a shared cache entry.
// Without this, two widgets sharing a slice/series label overwrite each other's value
// (one chart "copies" the other). Mirrors the production cache config in useApolloFactory.ts.
const buildCache = () =>
  new InMemoryCache({
    typePolicies: {
      RemoteTable: { keyFields: ['name'] },
    },
  });

const variablesForFilter = (filter: string) => ({
  input: { objectMetadataId: 'opportunity', configuration: { filter } },
});

const writePie = (cache: InMemoryCache, filter: string, value: number) => {
  cache.writeQuery({
    query: PIE_CHART_DATA,
    variables: variablesForFilter(filter),
    data: {
      pieChartData: {
        __typename: 'PieChartData',
        data: [{ __typename: 'PieChartDataItem', key: 'New', value }],
        showLegend: true,
        showDataLabels: false,
        showCenterMetric: true,
        hasTooManyGroups: false,
        formattedToRawLookup: {},
      },
    },
  });
};

const readPieNewValue = (cache: InMemoryCache, filter: string) =>
  cache.readQuery<{ pieChartData: { data: Array<{ value: number }> } }>({
    query: PIE_CHART_DATA,
    variables: variablesForFilter(filter),
  })?.pieChartData.data[0].value;

const writeLine = (cache: InMemoryCache, filter: string, y: number) => {
  cache.writeQuery({
    query: LINE_CHART_DATA,
    variables: variablesForFilter(filter),
    data: {
      lineChartData: {
        __typename: 'LineChartData',
        series: [
          {
            __typename: 'LineChartSeries',
            key: 'Won',
            label: 'Won',
            data: [{ __typename: 'LineChartDataPoint', x: '2024', y }],
          },
        ],
        xAxisLabel: '',
        yAxisLabel: '',
        showLegend: true,
        showDataLabels: false,
        hasTooManyGroups: false,
        formattedToRawLookup: {},
      },
    },
  });
};

const readLineFirstY = (cache: InMemoryCache, filter: string) =>
  cache.readQuery<{
    lineChartData: { series: Array<{ data: Array<{ y: number }> }> };
  }>({
    query: LINE_CHART_DATA,
    variables: variablesForFilter(filter),
  })?.lineChartData.series[0].data[0].y;

const hasNormalizedEntry = (cache: InMemoryCache, typename: string) =>
  Object.keys(cache.extract()).some((cacheKey) =>
    cacheKey.startsWith(`${typename}:`),
  );

describe('chart data cache normalization', () => {
  it('keeps pie slice values independent when two widgets share a slice label', () => {
    const cache = buildCache();

    writePie(cache, 'all', 100);
    writePie(cache, 'lo', 5);

    expect(readPieNewValue(cache, 'all')).toBe(100);
    expect(hasNormalizedEntry(cache, 'PieChartDataItem')).toBe(false);
  });

  it('keeps line series values independent when two widgets share a series key', () => {
    const cache = buildCache();

    writeLine(cache, 'all', 100);
    writeLine(cache, 'lo', 5);

    expect(readLineFirstY(cache, 'all')).toBe(100);
    expect(hasNormalizedEntry(cache, 'LineChartSeries')).toBe(false);
  });
});
