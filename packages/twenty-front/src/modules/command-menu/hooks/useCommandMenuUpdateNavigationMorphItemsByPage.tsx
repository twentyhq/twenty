import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { useCallback } from 'react';
import { useStore } from 'jotai';

type UpdateNavigationMorphItemsByPageParams = {
  pageId: string;
  objectMetadataId: string;
  objectRecordIds: string[];
};

export const useCommandMenuUpdateNavigationMorphItemsByPage = () => {
  const store = useStore();
  const updateCommandMenuNavigationMorphItemsByPage = useCallback(
    async ({
      pageId,
      objectMetadataId,
      objectRecordIds,
    }: UpdateNavigationMorphItemsByPageParams) => {
      const currentMorphItems = store.get(
        commandMenuNavigationMorphItemsByPageState.atom,
      );

      const newMorphItems = objectRecordIds.map((recordId) => ({
        objectMetadataId,
        recordId,
      }));

      const newMorphItemsMap = new Map(currentMorphItems);
      newMorphItemsMap.set(pageId, newMorphItems);
      store.set(
        commandMenuNavigationMorphItemsByPageState.atom,
        newMorphItemsMap,
      );
    },
    [store],
  );

  return {
    updateCommandMenuNavigationMorphItemsByPage,
  };
};
