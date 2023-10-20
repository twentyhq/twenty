import { useRecoilValue } from 'recoil';

import { activeMetadataObjectsSelector } from '../states/selectors/activeMetadataObjectsSelector';
import { disabledMetadataObjectsSelector } from '../states/selectors/disabledMetadataObjectsSelector';

export const useObjectMetadata = () => {
  const activeMetadataObjects = useRecoilValue(activeMetadataObjectsSelector);
  const disabledMetadataObjects = useRecoilValue(
    disabledMetadataObjectsSelector,
  );

  return {
    activeObjects: activeMetadataObjects,
    disabledObjects: disabledMetadataObjects,
  };
};
