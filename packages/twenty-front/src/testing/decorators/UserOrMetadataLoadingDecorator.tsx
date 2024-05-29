import React from 'react';
import { Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { isCurrentUserLoadedState } from '@/auth/states/isCurrentUserLoadingState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const UserOrMetadataLoadingDecorator: Decorator = (Story) => {
  const setIsCurrentUserLoaded = useSetRecoilState(isCurrentUserLoadedState);
  const setObjectMetadataItems = useSetRecoilState(objectMetadataItemsState);

  setIsCurrentUserLoaded(false);
  setObjectMetadataItems([]);

  return <Story />;
};
