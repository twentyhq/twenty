import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadMockedObjectMetadataItems = () => {
  const loadMockedObjectMetadataItems = useCallback(async () => {
    if (
      !isDeeplyEqual(
        jotaiStore.get(objectMetadataItemsState.atom),
        generatedMockObjectMetadataItems,
      )
    ) {
      jotaiStore.set(
        objectMetadataItemsState.atom,
        generatedMockObjectMetadataItems,
      );
    }

    if (jotaiStore.get(isAppEffectRedirectEnabledState.atom) === false) {
      jotaiStore.set(isAppEffectRedirectEnabledState.atom, true);
    }
  }, []);

  return {
    loadMockedObjectMetadataItems,
  };
};
