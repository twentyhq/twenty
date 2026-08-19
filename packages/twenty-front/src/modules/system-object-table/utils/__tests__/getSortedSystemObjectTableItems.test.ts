import { type SystemObjectTableColumn } from '@/system-object-table/types/SystemObjectTableColumn';
import { getSortedSystemObjectTableItems } from '@/system-object-table/utils/getSortedSystemObjectTableItems';

type TestItem = {
  name: string;
  updatedAt?: Date;
  runCount: number;
};

const items: TestItem[] = [
  { name: 'beta', updatedAt: new Date('2026-01-02'), runCount: 5 },
  { name: 'Alpha', updatedAt: new Date('2026-03-01'), runCount: 12 },
  { name: 'gamma', updatedAt: undefined, runCount: 1 },
];

const columns: SystemObjectTableColumn<TestItem>[] = [
  {
    key: 'name',
    label: 'Name',
    getSortValue: (item) => item.name,
    render: (item) => item.name,
  },
  {
    key: 'updatedAt',
    label: 'Updated',
    getSortValue: (item) => item.updatedAt,
    render: (item) => item.updatedAt?.toISOString(),
  },
  {
    key: 'runCount',
    label: 'Runs',
    getSortValue: (item) => item.runCount,
    render: (item) => item.runCount,
  },
  { key: 'noSort', label: 'No sort', render: (item) => item.name },
];

describe('getSortedSystemObjectTableItems', () => {
  it('should return items untouched when no sort is applied', () => {
    expect(
      getSortedSystemObjectTableItems({ items, columns, sort: null }),
    ).toEqual(items);
  });

  it('should sort strings case-insensitively ascending', () => {
    const sorted = getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'name', direction: 'asc' },
    });

    expect(sorted.map((item) => item.name)).toEqual(['Alpha', 'beta', 'gamma']);
  });

  it('should reverse the order when sorting descending', () => {
    const sorted = getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'name', direction: 'desc' },
    });

    expect(sorted.map((item) => item.name)).toEqual(['gamma', 'beta', 'Alpha']);
  });

  it('should sort dates chronologically', () => {
    const sorted = getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'updatedAt', direction: 'asc' },
    });

    expect(sorted.map((item) => item.name)).toEqual(['beta', 'Alpha', 'gamma']);
  });

  it('should keep empty values last whatever the direction', () => {
    const sortedDesc = getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'updatedAt', direction: 'desc' },
    });

    expect(sortedDesc[sortedDesc.length - 1].name).toBe('gamma');
  });

  it('should sort numbers numerically', () => {
    const sorted = getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'runCount', direction: 'asc' },
    });

    expect(sorted.map((item) => item.runCount)).toEqual([1, 5, 12]);
  });

  it('should return items untouched when the column has no sort value getter', () => {
    expect(
      getSortedSystemObjectTableItems({
        items,
        columns,
        sort: { columnKey: 'noSort', direction: 'asc' },
      }),
    ).toEqual(items);
  });

  it('should not mutate the input array', () => {
    const originalOrder = [...items];

    getSortedSystemObjectTableItems({
      items,
      columns,
      sort: { columnKey: 'name', direction: 'asc' },
    });

    expect(items).toEqual(originalOrder);
  });
});
