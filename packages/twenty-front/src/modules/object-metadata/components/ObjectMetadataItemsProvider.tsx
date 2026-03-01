import React, { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isObjectMetadataLoadedState } from '@/object-metadata/states/isObjectMetadataLoadedState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const shouldAppBeLoading = useRecoilValue(shouldAppBeLoadingState);
  const setIsObjectMetadataLoaded = useSetRecoilState(
    isObjectMetadataLoadedState,
  );

  const isReady = !shouldAppBeLoading && objectMetadataItems.length > 0;

  useEffect(() => {
    setIsObjectMetadataLoaded(isReady);
  }, [isReady, setIsObjectMetadataLoaded]);

  return (
    <>
      {isReady ? (
        <PreComputedChipGeneratorsProvider>
          {children}
        </PreComputedChipGeneratorsProvider>
      ) : (
        <UserOrMetadataLoader />
      )}
    </>
  );
};
