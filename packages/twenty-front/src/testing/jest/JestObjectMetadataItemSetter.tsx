import { type ReactNode, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const JestObjectMetadataItemSetter = ({
  children,
  objectMetadataItems,
}: {
  children: ReactNode;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  const setObjectMetadataItems = useSetRecoilState(objectMetadataItemsState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setObjectMetadataItems(
      objectMetadataItems ?? generatedMockObjectMetadataItems,
    );
    setIsLoaded(true);
  }, [objectMetadataItems, setObjectMetadataItems]);

  return isLoaded ? <>{children}</> : null;
};
