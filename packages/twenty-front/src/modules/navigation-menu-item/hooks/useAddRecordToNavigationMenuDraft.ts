import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { computeInsertIndexAndPosition } from '@/navigation-menu-item/utils/computeInsertIndexAndPosition';

type SearchRecord = {
  recordId: string;
  objectNameSingular: string;
  label: string;
  imageUrl?: string | null;
};

type SearchRecordWithOptionalMetadataId = SearchRecord & {
  objectMetadataId?: string;
};

export const useAddRecordToNavigationMenuDraft = () => {
  const setNavigationMenuItemsDraft = useSetRecoilState(
    navigationMenuItemsDraftState,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const addRecordToDraft = (
    searchRecord: SearchRecordWithOptionalMetadataId,
    currentDraft: NavigationMenuItem[],
    targetFolderId?: string | null,
    targetIndex?: number,
  ): string | undefined => {
    const objectMetadataId =
      searchRecord.objectMetadataId ??
      objectMetadataItems.find(
        (item) => item.nameSingular === searchRecord.objectNameSingular,
      )?.id;

    if (!isDefined(objectMetadataId)) {
      return undefined;
    }

    const folderId = targetFolderId ?? null;

    const itemsInFolder = currentDraft.filter(
      (item) =>
        (item.folderId ?? null) === folderId &&
        !isDefined(item.userWorkspaceId),
    );
    const index = targetIndex ?? itemsInFolder.length;

    const { flatIndex, position } = computeInsertIndexAndPosition(
      currentDraft,
      folderId,
      index,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      viewId: undefined,
      targetObjectMetadataId: objectMetadataId,
      targetRecordId: searchRecord.recordId,
      targetRecordIdentifier: {
        id: searchRecord.recordId,
        labelIdentifier: searchRecord.label,
        imageIdentifier: searchRecord.imageUrl ?? null,
      },
      position,
      userWorkspaceId: undefined,
      folderId: folderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newDraft = [
      ...currentDraft.slice(0, flatIndex),
      newItem,
      ...currentDraft.slice(flatIndex),
    ];
    setNavigationMenuItemsDraft(newDraft);
    return newItemId;
  };

  return { addRecordToDraft };
};
