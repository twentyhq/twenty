import { type ReactNode, useEffect, useState } from 'react';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useStore } from 'jotai';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

export const JestObjectMetadataItemSetter = ({
  children,
  objectMetadataItems,
}: {
  children: ReactNode;
  objectMetadataItems?: EnrichedObjectMetadataItem[];
}) => {
  const store = useStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTestObjectMetadataItemsInMetadataStore(
      store,
      objectMetadataItems ?? getTestEnrichedObjectMetadataItemsMock(),
    );
    setIsLoaded(true);
  }, [objectMetadataItems, store]);

  return isLoaded ? <>{children}</> : null;
};
