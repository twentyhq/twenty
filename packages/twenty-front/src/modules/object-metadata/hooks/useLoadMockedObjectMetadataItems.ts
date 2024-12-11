import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilCallback } from 'recoil';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadMockedObjectMetadataItems = () => {
  const loadMockedObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            generatedMockObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, generatedMockObjectMetadataItems);
        }
      },
    [],
  );
  return {
    loadMockedObjectMetadataItems,
  };
};
