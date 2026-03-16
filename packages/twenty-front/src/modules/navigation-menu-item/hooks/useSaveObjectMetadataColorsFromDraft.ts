import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSaveObjectMetadataColorsFromDraft = () => {
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );
  const { navigationMenuItems } = useNavigationMenuItemsData();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const saveObjectMetadataColors = async () => {
    if (!isDefined(navigationMenuItemsDraft)) return;

    const persistedById = new Map(
      navigationMenuItems.map((item) => [item.id, item]),
    );

    for (const draftItem of navigationMenuItemsDraft) {
      if (draftItem.type !== NavigationMenuItemType.OBJECT) continue;
      if (!isDefined(draftItem.targetObjectMetadataId)) continue;

      const original = persistedById.get(draftItem.id);

      if (!isDefined(original)) continue;
      if ((original.color ?? null) === (draftItem.color ?? null)) continue;

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === draftItem.targetObjectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) continue;
      if (objectMetadataItem.color === draftItem.color) continue;

      await updateOneObjectMetadataItem({
        idToUpdate: draftItem.targetObjectMetadataId,
        updatePayload: { color: draftItem.color ?? null },
      });
    }
  };

  return { saveObjectMetadataColors };
};
