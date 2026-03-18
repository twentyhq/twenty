import { type ReactNode, useEffect, useState } from 'react';

import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

export const JestObjectMetadataItemSetter = ({
  children,
  objectMetadataItems,
}: {
  children: ReactNode;
  objectMetadataItems?: ObjectMetadataItem[];
}) => {
  const { replaceDraft, applyChanges } = useMetadataStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const items = objectMetadataItems ?? generatedMockObjectMetadataItems;
    const { flatObjects, flatFields, flatIndexes } =
      splitObjectMetadataItemWithRelated(items);

    replaceDraft('objectMetadataItems', flatObjects);
    replaceDraft('fieldMetadataItems', flatFields);
    replaceDraft('indexMetadataItems', flatIndexes);
    applyChanges();
    setIsLoaded(true);
  }, [objectMetadataItems, replaceDraft, applyChanges]);

  return isLoaded ? <>{children}</> : null;
};
