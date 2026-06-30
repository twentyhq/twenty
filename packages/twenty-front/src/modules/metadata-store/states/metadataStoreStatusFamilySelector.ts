import {
  metadataStoreState,
  type MetadataEntityKey,
  type MetadataEntityStoreStatus,
} from '@/metadata-store/states/metadataStoreState';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const metadataStoreStatusFamilySelector = createAtomFamilySelector<
  MetadataEntityStoreStatus,
  MetadataEntityKey
>({
  key: 'metadataStoreStatusFamilySelector',
  get:
    (entityKey: MetadataEntityKey) =>
    ({ get }) => {
      const storeItem = get(metadataStoreState, entityKey);

      return storeItem.status;
    },
});
