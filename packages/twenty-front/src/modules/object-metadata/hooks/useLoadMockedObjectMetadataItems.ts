import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilCallback } from 'recoil';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadMockedObjectMetadataItems = () => {
  const loadMockedObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        const { generatedMockObjectMetadataItems } = await import(
          '~/testing/utils/generatedMockObjectMetadataItems'
        );

        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            generatedMockObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, generatedMockObjectMetadataItems);
        }

        if (
          snapshot
            .getLoadable(isAppWaitingForFreshObjectMetadataState)
            .getValue() === true
        ) {
          set(isAppWaitingForFreshObjectMetadataState, false);
        }
      },
    [],
  );
  return {
    loadMockedObjectMetadataItems,
  };
};
