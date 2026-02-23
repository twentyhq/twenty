import React from 'react';

import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { shouldAppBeLoadingState } from '@/object-metadata/states/shouldAppBeLoadingState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const ObjectMetadataItemsProvider = ({
  children,
}: React.PropsWithChildren) => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const shouldAppBeLoading = useRecoilValueV2(shouldAppBeLoadingState);

  const shouldDisplayChildren =
    !shouldAppBeLoading && objectMetadataItems.length > 0;

  return (
    <>
      {shouldDisplayChildren ? (
        <PreComputedChipGeneratorsProvider>
          {children}
        </PreComputedChipGeneratorsProvider>
      ) : (
        <UserOrMetadataLoader />
      )}
    </>
  );
};
