import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';

type UpdateNavigationMorphItemsByPageParams = {
  pageId: string;
  objectMetadataId: string;
  objectRecordIds: string[];
};

export const useCommandMenuUpdateNavigationMorphItemsByPage = () => {
  const updateCommandMenuNavigationMorphItemsByPage = useCallback(
    async ({
      pageId,
      objectMetadataId,
      objectRecordIds,
    }: UpdateNavigationMorphItemsByPageParams) => {
      const currentMorphItems = jotaiStore.get(
        commandMenuNavigationMorphItemsByPageState.atom,
      );

      const newMorphItems = objectRecordIds.map((recordId) => ({
        objectMetadataId,
        recordId,
      }));

      const newMorphItemsMap = new Map(currentMorphItems);
      newMorphItemsMap.set(pageId, newMorphItems);
      jotaiStore.set(
        commandMenuNavigationMorphItemsByPageState.atom,
        newMorphItemsMap,
      );
    },
    [],
  );

  return {
    updateCommandMenuNavigationMorphItemsByPage,
  };
};
