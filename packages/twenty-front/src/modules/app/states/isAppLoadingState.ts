import { metadataStoreState } from '@/app/states/metadataStoreState';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';

export const isAppLoadingState = createSelectorV2<boolean>({
  key: 'isAppLoadingState',
  get: ({ get }) => {
    const objectsEntry = get(metadataStoreState, 'objects');
    const viewsEntry = get(metadataStoreState, 'views');

    return objectsEntry.status !== 'loaded' || viewsEntry.status !== 'loaded';
  },
});
