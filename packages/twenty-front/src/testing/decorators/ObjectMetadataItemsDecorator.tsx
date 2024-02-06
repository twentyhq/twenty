import { Decorator } from '@storybook/react';
import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {!!objectMetadataItems.length && <Story />}
    </>
  );
};
