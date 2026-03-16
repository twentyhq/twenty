import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useSaveObjectMetadataColorsFromDraft = () => {
  const navigationMenuItemsDraft = useAtomStateValue(
    navigationMenuItemsDraftState,
  );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const saveObjectMetadataColors = async () => {
    if (!isDefined(navigationMenuItemsDraft)) {
      return;
    }

    for (const draftItem of navigationMenuItemsDraft) {
      if (draftItem.type !== NavigationMenuItemType.OBJECT) continue;
      if (!isDefined(draftItem.targetObjectMetadataId)) continue;
      if (!isDefined(draftItem.color)) continue;

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === draftItem.targetObjectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) continue;
      if (objectMetadataItem.color === draftItem.color) continue;

      await updateOneObjectMetadataItem({
        idToUpdate: draftItem.targetObjectMetadataId,
        updatePayload: { color: draftItem.color },
      });
    }
  };

  return { saveObjectMetadataColors };
};
