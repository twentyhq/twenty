import { type ReactNode, useEffect, useState } from 'react';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const JestObjectMetadataItemSetter = ({
  children,
  objectMetadataItems,
}: {
  children: ReactNode;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  const setObjectMetadataItems = useSetRecoilStateV2(objectMetadataItemsState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setObjectMetadataItems(
      objectMetadataItems ?? generatedMockObjectMetadataItems,
    );
    setIsLoaded(true);
  }, [objectMetadataItems, setObjectMetadataItems]);

  return isLoaded ? <>{children}</> : null;
};
