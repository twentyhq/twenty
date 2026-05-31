import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { computeInsertIndexAndPosition } from '@/navigation-menu-item/common/utils/computeInsertIndexAndPosition';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  const { currentItems, targetUserWorkspaceId, applyCreate } =
    useNavigationMenuItemEditController();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const addRecordToDraft = (
    searchRecord: SearchRecordWithOptionalMetadataId,
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

    const itemsInFolder = currentItems.filter(
      (item) => (item.folderId ?? null) === folderId,
    );
    const index = targetIndex ?? itemsInFolder.length;

    const { flatIndex, position } = computeInsertIndexAndPosition(
      currentItems,
      folderId,
      index,
    );

    const newItemId = v4();
    const newItem: NavigationMenuItem = {
      __typename: 'NavigationMenuItem',
      id: newItemId,
      type: NavigationMenuItemType.RECORD,
      viewId: undefined,
      targetObjectMetadataId: objectMetadataId,
      targetRecordId: searchRecord.recordId,
      targetRecordIdentifier: {
        id: searchRecord.recordId,
        labelIdentifier: searchRecord.label,
        imageIdentifier: searchRecord.imageUrl ?? null,
      },
      position,
      userWorkspaceId: targetUserWorkspaceId,
      folderId: folderId ?? undefined,
      name: undefined,
      applicationId: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    void applyCreate(newItem, flatIndex);
    return newItemId;
  };

  return { addRecordToDraft };
};
