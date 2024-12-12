import React from 'react';
import { useRecoilValue } from 'recoil';

import { isAppWaitingForFreshObjectMetadataState } from '@/object-metadata/states/isAppWaitingForFreshObjectMetadataState';
import { UserOrMetadataLoader } from '~/loading/components/UserOrMetadataLoader';

export const ObjectMetadataItemsGater = ({
  children,
}: React.PropsWithChildren) => {
  const isAppWaitingForFreshObjectMetadata = useRecoilValue(
    isAppWaitingForFreshObjectMetadataState,
  );

  const shouldDisplayChildren = !isAppWaitingForFreshObjectMetadata;

  return (
    <>{shouldDisplayChildren ? <>{children}</> : <UserOrMetadataLoader />}</>
  );
};
