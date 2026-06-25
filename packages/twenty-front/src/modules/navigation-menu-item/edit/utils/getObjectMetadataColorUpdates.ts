import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type ObjectMetadataColorUpdate = {
  idToUpdate: string;
  color: string;
};

export const getObjectMetadataColorUpdates = ({
  draft,
  currentItems,
}: {
  draft: NavigationMenuItem[];
  currentItems: NavigationMenuItem[];
}): ObjectMetadataColorUpdate[] => {
  const updates: ObjectMetadataColorUpdate[] = [];

  for (const draftItem of draft) {
    if (draftItem.type !== NavigationMenuItemType.OBJECT) {
      continue;
    }
    if (!isDefined(draftItem.targetObjectMetadataId)) {
      continue;
    }
    if (!isDefined(draftItem.color)) {
      continue;
    }

    const currentItem = currentItems.find((item) => item.id === draftItem.id);

    if (currentItem?.color === draftItem.color) {
      continue;
    }

    updates.push({
      idToUpdate: draftItem.targetObjectMetadataId,
      color: draftItem.color,
    });
  }

  return updates;
};
