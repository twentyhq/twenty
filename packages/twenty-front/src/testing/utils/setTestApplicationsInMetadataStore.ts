import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { type createStore } from 'jotai';

type JotaiStore = ReturnType<typeof createStore>;

export const setTestApplicationsInMetadataStore = (
  store: JotaiStore,
  applications: FlatApplication[],
) => {
  store.set(metadataStoreState.atomFamily('applications'), {
    current: applications,
    draft: [],
    status: 'up-to-date',
  });
};
