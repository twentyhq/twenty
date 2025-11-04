import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
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

        if (
          snapshot.getLoadable(isAppEffectRedirectEnabledState).getValue() ===
          false
        ) {
          set(isAppEffectRedirectEnabledState, true);
        }
      },
    [],
  );
  return {
    loadMockedObjectMetadataItems,
  };
};
