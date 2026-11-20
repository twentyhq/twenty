import { type ViewMetadataSlice } from '@/metadata-store/types/ViewMetadataSlice';
import { getDraftOrCurrentMetadataItems } from '@/metadata-store/utils/getDraftOrCurrentMetadataItems';
import { type createStore } from 'jotai';

export const getViewMetadataSlice = (
  store: ReturnType<typeof createStore>,
): ViewMetadataSlice => ({
  views: getDraftOrCurrentMetadataItems({ store, metadataEntityKey: 'views' }),
  viewFields: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewFields',
  }),
  viewFilters: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewFilters',
  }),
  viewSorts: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewSorts',
  }),
  viewGroups: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewGroups',
  }),
  viewFilterGroups: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewFilterGroups',
  }),
  viewFieldGroups: getDraftOrCurrentMetadataItems({
    store,
    metadataEntityKey: 'viewFieldGroups',
  }),
});
