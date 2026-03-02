import { type ReactNode, useEffect, useState } from 'react';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const JestObjectMetadataItemSetter = ({
  children,
  objectMetadataItems,
}: {
  children: ReactNode;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  const setObjectMetadataItems = useSetAtomState(objectMetadataItemsState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setObjectMetadataItems(
      objectMetadataItems ?? generatedMockObjectMetadataItems,
    );
    setIsLoaded(true);
  }, [objectMetadataItems, setObjectMetadataItems]);

  return isLoaded ? <>{children}</> : null;
};
