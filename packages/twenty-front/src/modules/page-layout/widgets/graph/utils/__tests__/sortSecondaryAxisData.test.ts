import { sortSecondaryAxisData } from '@/page-layout/widgets/graph/utils/sortSecondaryAxisData';
import { GraphOrderBy } from '~/generated/graphql';

type TestItem = { label: string };

const testItems: TestItem[] = [
  { label: 'Beta' },
  { label: 'Alpha' },
  { label: 'Gamma' },
];
const getFormattedValue = (item: TestItem) => item.label;

describe('sortSecondaryAxisData', () => {
  it('should sort by FIELD_ASC', () => {
    const result = sortSecondaryAxisData({
      items: testItems,
      orderBy: GraphOrderBy.FIELD_ASC,
      getFormattedValue,
    });

    expect(result.map((i) => i.label)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });

  it('should sort by FIELD_DESC', () => {
    const result = sortSecondaryAxisData({
      items: testItems,
      orderBy: GraphOrderBy.FIELD_DESC,
      getFormattedValue,
    });

    expect(result.map((i) => i.label)).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('should return items unchanged when orderBy is undefined', () => {
    const result = sortSecondaryAxisData({
      items: testItems,
      orderBy: undefined,
      getFormattedValue,
    });

    expect(result).toEqual(testItems);
  });
});
