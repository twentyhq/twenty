import { sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually } from '@/page-layout/widgets/graph/utils/sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually';
import { GraphOrderBy } from '~/generated/graphql';

type TestItem = { label: string };

const testData: TestItem[] = [
  { label: 'Beta' },
  { label: 'Alpha' },
  { label: 'Gamma' },
];
const formattedToRawLookup = new Map([
  ['Alpha', 'ALPHA'],
  ['Beta', 'BETA'],
  ['Gamma', 'GAMMA'],
]);
const getFormattedValue = (item: TestItem) => item.label;

describe('sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually', () => {
  it('should sort by FIELD_ASC', () => {
    const result = sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
      data: testData,
      orderBy: GraphOrderBy.FIELD_ASC,
      formattedToRawLookup,
      getFormattedValue,
    });

    expect(result.map((i) => i.label)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('should sort by MANUAL order', () => {
    const result = sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
      data: testData,
      orderBy: GraphOrderBy.MANUAL,
      manualSortOrder: ['GAMMA', 'ALPHA', 'BETA'],
      formattedToRawLookup,
      getFormattedValue,
    });

    expect(result.map((i) => i.label)).toEqual(['Gamma', 'Alpha', 'Beta']);
  });

  it('should return data unchanged when orderBy is undefined', () => {
    const result = sortTwoDimensionalChartPrimaryAxisDataByFieldOrManually({
      data: testData,
      orderBy: undefined,
      formattedToRawLookup,
      getFormattedValue,
    });

    expect(result).toEqual(testData);
  });
});
