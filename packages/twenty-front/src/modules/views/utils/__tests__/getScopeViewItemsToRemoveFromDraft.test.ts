import { getScopeViewItemsToRemoveFromDraft } from '@/views/utils/getScopeViewItemsToRemoveFromDraft';

const previousScopeView = {
  id: 'scope-view',
  viewFilters: [{ id: 'filter' }],
  viewFilterGroups: [{ id: 'filter-group' }],
  viewSorts: [{ id: 'sort' }],
};

describe('getScopeViewItemsToRemoveFromDraft', () => {
  it('removes the previous children and keeps the scope view the server returns again', () => {
    expect(
      getScopeViewItemsToRemoveFromDraft({
        previousScopeView,
        nextScopeViewId: 'scope-view',
      }),
    ).toEqual([
      { key: 'viewFilters', itemIds: ['filter'] },
      { key: 'viewFilterGroups', itemIds: ['filter-group'] },
      { key: 'viewSorts', itemIds: ['sort'] },
      { key: 'views', itemIds: [] },
    ]);
  });

  it('removes the previous scope view when the server no longer returns it', () => {
    expect(
      getScopeViewItemsToRemoveFromDraft({
        previousScopeView,
        nextScopeViewId: undefined,
      }),
    ).toContainEqual({ key: 'views', itemIds: ['scope-view'] });
  });
});
