import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { atom } from 'recoil';

// Bridge atom that keeps Recoil in sync with the Jotai V2 objectMetadataItemsState.
// Needed by Recoil selectors that depend on objectMetadataItemsState but cannot
// track Jotai atoms through Recoil's dependency graph.
export const objectMetadataItemsRecoilBridge = atom<ObjectMetadataItem[]>({
  key: 'objectMetadataItemsRecoilBridge',
  default: [],
  effects: [
    ({ setSelf }) => {
      setSelf(jotaiStore.get(objectMetadataItemsState.atom));

      const unsubscribe = jotaiStore.sub(objectMetadataItemsState.atom, () => {
        setSelf(jotaiStore.get(objectMetadataItemsState.atom));
      });

      return unsubscribe;
    },
  ],
});
