import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded';
import { GraphOrderBy } from '~/generated/graphql';

type TestItem = { label: string };

const testData: TestItem[] = [
  { label: 'Beta' },
  { label: 'Alpha' },
  { label: 'Gamma' },
];

const fieldAscTestData: TestItem[] = [
  { label: 'Alpha' },
  { label: 'Beta' },
  { label: 'Gamma' },
];

const formattedToRawLookup = new Map([
  ['Alpha', 'ALPHA'],
  ['Beta', 'BETA'],
  ['Gamma', 'GAMMA'],
]);

const getFormattedValue = (item: TestItem) => item.label;

describe('sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded', () => {
  it('should return data unchanged by FIELD_ASC, since it is already sorted by the backend', () => {
    const result =
      sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded({
        data: fieldAscTestData,
        orderBy: GraphOrderBy.FIELD_ASC,
        formattedToRawLookup,
        getFormattedValue,
      });

    expect(result.map((i) => i.label)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('should sort by MANUAL order', () => {
    const result =
      sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded({
        data: testData,
        orderBy: GraphOrderBy.MANUAL,
        manualSortOrder: ['GAMMA', 'ALPHA', 'BETA'],
        formattedToRawLookup,
        getFormattedValue,
      });

    expect(result.map((i) => i.label)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('should return data unchanged when orderBy is undefined', () => {
    const result =
      sortTwoDimensionalChartPrimaryAxisDataByFieldOrManuallyIfNeeded({
        data: testData,
        orderBy: undefined,
        formattedToRawLookup,
        getFormattedValue,
      });

    expect(result).toEqual(testData);
  });
});
