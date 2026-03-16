import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { useCallback } from 'react';

export const useLoadMockedObjectMetadataItems = () => {
  const { updateDraft, applyChanges } = useMetadataStore();

  const loadMockedObjectMetadataItems = useCallback(async () => {
    const { generatedMockObjectMetadataItems } = await import(
      '~/testing/utils/generatedMockObjectMetadataItems'
    );

    const { flatObjects, flatFields, flatIndexes } =
      splitObjectMetadataItemWithRelated(generatedMockObjectMetadataItems);

    updateDraft('objectMetadataItems', flatObjects);
    updateDraft('fieldMetadataItems', flatFields);
    updateDraft('indexMetadataItems', flatIndexes);
    applyChanges();
  }, [updateDraft, applyChanges]);

  return {
    loadMockedObjectMetadataItems,
  };
};
