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
  const { updateDraft, applyChanges, resetMetadataStore } = useMetadataStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const items = objectMetadataItems ?? generatedMockObjectMetadataItems;
    const { flatObjects, flatFields, flatIndexes } =
      splitObjectMetadataItemWithRelated(items);

    // Reset first so updateDraft always proceeds and writes to localStorage.
    // Without this, atomWithStorage's onMount re-reads from empty localStorage
    // and overwrites in-memory values when the store is reused across tests.
    resetMetadataStore();

    updateDraft('objectMetadataItems', flatObjects);
    updateDraft('fieldMetadataItems', flatFields);
    updateDraft('indexMetadataItems', flatIndexes);
    applyChanges();
    setIsLoaded(true);
  }, [objectMetadataItems, updateDraft, applyChanges, resetMetadataStore]);

  return isLoaded ? <>{children}</> : null;
};
