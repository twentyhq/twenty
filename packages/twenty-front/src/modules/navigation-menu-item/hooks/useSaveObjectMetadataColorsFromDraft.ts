import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import type { NavigationMenuItem } from '~/generated-metadata/graphql';

import { useNavigationMenuItemsData } from '@/navigation-menu-item/hooks/useNavigationMenuItemsData';
import { navigationMenuItemsDraftState } from '@/navigation-menu-item/states/navigationMenuItemsDraftState';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

export const useSaveObjectMetadataColorsFromDraft = () => {
  const draft = useAtomStateValue(navigationMenuItemsDraftState);
  const { navigationMenuItems } = useNavigationMenuItemsData();
  const views = useAtomStateValue(viewsSelector);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const saveObjectMetadataColors = async () => {
    if (!isDefined(draft)) return;

    const persistedById = new Map(
      navigationMenuItems.map((item) => [item.id, item]),
    );

    for (const draftItem of draft) {
      if (draftItem.type !== NavigationMenuItemType.OBJECT) continue;

      const original = persistedById.get(draftItem.id);

      if (!isDefined(original)) continue;
      if ((original.color ?? null) === (draftItem.color ?? null)) continue;

      const objectMetadataId = resolveObjectMetadataId(draftItem, views);

      if (!isDefined(objectMetadataId)) continue;

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataId,
      );

      if (!isDefined(objectMetadataItem)) continue;
      if (objectMetadataItem.color === draftItem.color) continue;

      await updateOneObjectMetadataItem({
        idToUpdate: objectMetadataId,
        updatePayload: { color: draftItem.color ?? null },
      });
    }
  };

  return { saveObjectMetadataColors };
};

const resolveObjectMetadataId = (
  item: NavigationMenuItem,
  views: { id: string; objectMetadataId: string }[],
): string | undefined => {
  if (isDefined(item.targetObjectMetadataId)) {
    return item.targetObjectMetadataId;
  }
  if (isDefined(item.viewId)) {
    const view = views.find((view) => view.id === item.viewId);

    return view?.objectMetadataId;
  }
  return undefined;
};
