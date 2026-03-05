import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

type UpdateNavigationMorphItemsByPageParams = {
  pageId: string;
  objectMetadataId: string;
  objectRecordIds: string[];
};

export const useSidePanelUpdateNavigationMorphItemsByPage = () => {
  const store = useStore();
  const updateSidePanelNavigationMorphItemsByPage = useCallback(
    async ({
      pageId,
      objectMetadataId,
      objectRecordIds,
    }: UpdateNavigationMorphItemsByPageParams) => {
      const currentMorphItems = store.get(
        sidePanelNavigationMorphItemsByPageState.atom,
      );

      const newMorphItems = objectRecordIds.map((recordId) => ({
        objectMetadataId,
        recordId,
      }));

      const newMorphItemsMap = new Map(currentMorphItems);
      newMorphItemsMap.set(pageId, newMorphItems);
      store.set(
        sidePanelNavigationMorphItemsByPageState.atom,
        newMorphItemsMap,
      );
    },
    [store],
  );

  return {
    updateSidePanelNavigationMorphItemsByPage,
  };
};
