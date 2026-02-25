import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useCallback } from 'react';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const useLoadMockedObjectMetadataItems = () => {
  const store = useStore();
  const loadMockedObjectMetadataItems = useCallback(async () => {
    if (
      !isDeeplyEqual(
        store.get(objectMetadataItemsState.atom),
        generatedMockObjectMetadataItems,
      )
    ) {
      store.set(
        objectMetadataItemsState.atom,
        generatedMockObjectMetadataItems,
      );
    }

    if (store.get(isAppEffectRedirectEnabledState.atom) === false) {
      store.set(isAppEffectRedirectEnabledState.atom, true);
    }
  }, [store]);

  return {
    loadMockedObjectMetadataItems,
  };
};
