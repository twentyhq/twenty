import { isAppEffectRedirectEnabledState } from '@/app/states/isAppEffectRedirectEnabledState';
import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';
import { splitObjectMetadataItemWithRelated } from '@/metadata-store/utils/splitObjectMetadataItemWithRelated';
import { useStore } from 'jotai';
import { useCallback } from 'react';

export const useLoadMockedObjectMetadataItems = () => {
  const store = useStore();
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

    if (store.get(isAppEffectRedirectEnabledState.atom) === false) {
      store.set(isAppEffectRedirectEnabledState.atom, true);
    }
  }, [store, updateDraft, applyChanges]);

  return {
    loadMockedObjectMetadataItems,
  };
};
