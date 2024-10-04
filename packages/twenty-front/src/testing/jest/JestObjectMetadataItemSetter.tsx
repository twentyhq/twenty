import { ReactNode, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

export const JestObjectMetadataItemSetter = ({
  children,
}: {
  children: ReactNode;
}) => {
  const setObjectMetadataItems = useSetRecoilState(objectMetadataItemsState);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setObjectMetadataItems(generatedMockObjectMetadataItems);
    setIsLoaded(true);
  }, [setObjectMetadataItems]);

  return isLoaded ? <>{children}</> : null;
};
