import { type MetadataEntityKey } from '@/metadata-store/states/metadataStoreState';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const metadataCollectionHashesState = createAtomState<
  Partial<Record<MetadataEntityKey, string>>
>({
  key: 'metadataCollectionHashesState',
  defaultValue: {},
  useLocalStorage: true,
  localStorageOptions: { getOnInit: true },
});
