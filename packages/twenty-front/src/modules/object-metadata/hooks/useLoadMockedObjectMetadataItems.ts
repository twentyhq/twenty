import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { useCallback } from 'react';

export const useLoadMockedObjectMetadataItems = () => {
  const { replaceDraft, applyChanges } = useMetadataStore();

  const loadMockedObjectMetadataItems = useCallback(async () => {
    const { generatedMockObjectMetadataItems } = await import(
      '~/testing/utils/generatedMockObjectMetadataItems'
    );

    const { flatObjects, flatFields, flatIndexes } =
      splitObjectMetadataItemWithRelated(generatedMockObjectMetadataItems);

    replaceDraft('objectMetadataItems', flatObjects);
    replaceDraft('fieldMetadataItems', flatFields);
    replaceDraft('indexMetadataItems', flatIndexes);
    applyChanges();
  }, [replaceDraft, applyChanges]);

  return {
    loadMockedObjectMetadataItems,
  };
};
