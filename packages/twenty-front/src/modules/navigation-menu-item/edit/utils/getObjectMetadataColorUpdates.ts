import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type ObjectMetadataColorUpdate = {
  idToUpdate: string;
  color: string;
};

export const getObjectMetadataColorUpdates = ({
  draft,
  objectMetadataItems,
}: {
  draft: NavigationMenuItem[];
  objectMetadataItems: EnrichedObjectMetadataItem[];
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

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === draftItem.targetObjectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      continue;
    }

    if (objectMetadataItem.color === draftItem.color) {
      continue;
    }

    updates.push({
      idToUpdate: draftItem.targetObjectMetadataId,
      color: draftItem.color,
    });
  }

  return updates;
};
