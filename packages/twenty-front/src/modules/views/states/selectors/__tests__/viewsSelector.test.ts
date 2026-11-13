import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { createStore } from 'jotai';
import { ViewFilterOperand } from 'twenty-shared/types';
import { ViewTabType } from '~/generated-metadata/graphql';
import { mockedViews } from '~/testing/mock-data/generated/metadata/views/mock-views-data';
import { setTestViewsInMetadataStore } from '~/testing/utils/setTestViewsInMetadataStore';

const VIEW_TAB_ID = 'mine-view-tab-id';

const viewWithTabFilter: ViewWithRelations = {
  ...mockedViews[0],
  viewFilters: [
    {
      id: 'view-filter-id',
      fieldMetadataId: 'name-field-metadata-id',
      operand: ViewFilterOperand.CONTAINS,
      value: 'Acme',
    },
    {
      id: 'tab-filter-id',
      fieldMetadataId: 'owner-field-metadata-id',
      operand: ViewFilterOperand.IS,
      value: '["me"]',
      viewTabId: VIEW_TAB_ID,
    },
  ],
  viewTabs: [
    {
      id: VIEW_TAB_ID,
      type: ViewTabType.CUSTOM,
      name: 'Mine',
      position: 0,
      isVisible: true,
    },
  ],
};

describe('viewsSelector', () => {
  it('should keep tab filters out of the view filters and attach them to their tab', () => {
    const store = createStore();

    setTestViewsInMetadataStore(store, [viewWithTabFilter]);

    const [view] = store.get(viewsSelector.atom);

    expect(view.viewFilters.map(({ id }) => id)).toEqual(['view-filter-id']);
    expect(view.viewTabs).toHaveLength(1);
    expect(view.viewTabs?.[0].viewFilters?.map(({ id }) => id)).toEqual([
      'tab-filter-id',
    ]);
  });
});
