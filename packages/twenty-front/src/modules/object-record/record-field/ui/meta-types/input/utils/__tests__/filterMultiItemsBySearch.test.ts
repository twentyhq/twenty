import { filterMultiItemsBySearch } from '@/object-record/record-field/ui/meta-types/input/utils/filterMultiItemsBySearch';

describe('filterMultiItemsBySearch', () => {
  const items = ['alpha', 'Beta', 'alpha'];

  it('keeps every item with its original index when the filter is empty', () => {
    expect(
      filterMultiItemsBySearch({
        items,
        searchFilter: '',
        getItemText: (item) => item,
      }),
    ).toEqual([
      { item: 'alpha', index: 0 },
      { item: 'Beta', index: 1 },
      { item: 'alpha', index: 2 },
    ]);
  });

  it('matches case-insensitively and keeps original indexes for duplicates', () => {
    expect(
      filterMultiItemsBySearch({
        items,
        searchFilter: 'ALPHA',
        getItemText: (item) => item,
      }),
    ).toEqual([
      { item: 'alpha', index: 0 },
      { item: 'alpha', index: 2 },
    ]);
  });
});
