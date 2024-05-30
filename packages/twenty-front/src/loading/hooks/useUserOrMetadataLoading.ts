import { useRecoilValue } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useUserOrMetadataLoading = () => {
  const isCurrentUserLoaded = useRecoilValue(isCurrentUserLoadedState);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return !isCurrentUserLoaded || objectMetadataItems.length === 0;
};
