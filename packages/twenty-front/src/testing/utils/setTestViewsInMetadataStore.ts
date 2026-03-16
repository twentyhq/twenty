import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { type createStore } from 'jotai';

type JotaiStore = ReturnType<typeof createStore>;

export const setTestViewsInMetadataStore = (
  store: JotaiStore,
  views: ViewWithRelations[],
) => {
  const {
    flatViews,
    flatViewFields,
    flatViewFilters,
    flatViewSorts,
    flatViewGroups,
    flatViewFilterGroups,
    flatViewFieldGroups,
  } = splitViewWithRelated(views);

  store.set(metadataStoreState.atomFamily('views'), {
    current: flatViews,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewFields'), {
    current: flatViewFields,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewFilters'), {
    current: flatViewFilters,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewSorts'), {
    current: flatViewSorts,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewGroups'), {
    current: flatViewGroups,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewFilterGroups'), {
    current: flatViewFilterGroups,
    draft: [],
    status: 'up-to-date',
  });

  store.set(metadataStoreState.atomFamily('viewFieldGroups'), {
    current: flatViewFieldGroups,
    draft: [],
    status: 'up-to-date',
  });
};
