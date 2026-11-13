import { type ViewFilter } from '@/views/types/ViewFilter';
import { splitViewFiltersByViewTab } from '@/views/utils/splitViewFiltersByViewTab';
import { ViewFilterOperand } from 'twenty-shared/types';

const buildViewFilter = (
  id: string,
  viewTabId?: string | null,
): ViewFilter => ({
  id,
  fieldMetadataId: 'field-metadata-id',
  operand: ViewFilterOperand.IS,
  value: '',
  viewTabId,
});

describe('splitViewFiltersByViewTab', () => {
  it('should keep filters without a tab as view filters', () => {
    const { viewFiltersWithoutViewTab, viewTabFiltersByViewTabId } =
      splitViewFiltersByViewTab([
        buildViewFilter('view-filter'),
        buildViewFilter('null-tab-view-filter', null),
      ]);

    expect(viewFiltersWithoutViewTab.map(({ id }) => id)).toEqual([
      'view-filter',
      'null-tab-view-filter',
    ]);
    expect(viewTabFiltersByViewTabId.size).toBe(0);
  });

  it('should group tab filters by tab and leave them out of view filters', () => {
    const { viewFiltersWithoutViewTab, viewTabFiltersByViewTabId } =
      splitViewFiltersByViewTab([
        buildViewFilter('view-filter'),
        buildViewFilter('mine-first', 'mine'),
        buildViewFilter('unassigned', 'unassigned'),
        buildViewFilter('mine-second', 'mine'),
      ]);

    expect(viewFiltersWithoutViewTab.map(({ id }) => id)).toEqual([
      'view-filter',
    ]);
    expect(viewTabFiltersByViewTabId.get('mine')?.map(({ id }) => id)).toEqual([
      'mine-first',
      'mine-second',
    ]);
    expect(
      viewTabFiltersByViewTabId.get('unassigned')?.map(({ id }) => id),
    ).toEqual(['unassigned']);
  });
});
