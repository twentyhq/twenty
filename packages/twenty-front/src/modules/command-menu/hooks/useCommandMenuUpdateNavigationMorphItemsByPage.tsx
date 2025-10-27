import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { isNonEmptyArray } from '@sniptt/guards';
import { useRecoilCallback } from 'recoil';

type UpdateNavigationMorphItemsByPageParams = {
  pageId: string;
  objectMetadataId: string;
  objectRecordIds: string[];
};

export const useCommandMenuUpdateNavigationMorphItemsByPage = () => {
  const updateCommandMenuNavigationMorphItemsByPage = useRecoilCallback(
    ({ set, snapshot }) =>
      async ({
        pageId,
        objectMetadataId,
        objectRecordIds,
      }: UpdateNavigationMorphItemsByPageParams) => {
        const currentMorphItems = snapshot
          .getLoadable(commandMenuNavigationMorphItemsByPageState)
          .getValue();

        const currentMorphItemsForPage = currentMorphItems.get(pageId);

        const newMorphItems = [
          ...(isNonEmptyArray(currentMorphItemsForPage)
            ? currentMorphItemsForPage
            : []),
          ...objectRecordIds.map((recordId) => ({
            objectMetadataId,
            recordId,
          })),
        ];

        const newMorphItemsMap = new Map(currentMorphItems);
        newMorphItemsMap.set(pageId, newMorphItems);
        set(commandMenuNavigationMorphItemsByPageState, newMorphItemsMap);
      },
    [],
  );

  return {
    updateCommandMenuNavigationMorphItemsByPage,
  };
};
