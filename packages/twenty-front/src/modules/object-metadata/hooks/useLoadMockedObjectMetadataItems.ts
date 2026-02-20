import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useRecoilCallback } from 'recoil';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadMockedObjectMetadataItems = () => {
  const loadMockedObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            generatedMockObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, generatedMockObjectMetadataItems);
        }

        if (snapshot.getLoadable(shouldAppBeLoadingState).getValue() === true) {
          set(shouldAppBeLoadingState, false);
        }

        if (jotaiStore.get(isAppEffectRedirectEnabledState.atom) === false) {
          jotaiStore.set(isAppEffectRedirectEnabledState.atom, true);
        }
      },
    [],
  );
  return {
    loadMockedObjectMetadataItems,
  };
};
