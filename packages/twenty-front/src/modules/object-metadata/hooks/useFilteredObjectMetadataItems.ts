import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

export const useFilteredObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activeObjectMetadataItems = objectMetadataItems.filter(
    ({ isActive, isSystem }) => isActive && !isSystem,
  );

  const alphaSortedActiveObjectMetadataItems = activeObjectMetadataItems.sort(
    (a, b) => {
      if (a.nameSingular < b.nameSingular) {
        return -1;
      }
      if (a.nameSingular > b.nameSingular) {
        return 1;
      }
      return 0;
    },
  );

  const inactiveObjectMetadataItems = objectMetadataItems.filter(
    ({ isActive, isSystem }) => !isActive && !isSystem,
  );

  const findActiveObjectMetadataItemByNamePlural = (namePlural: string) =>
    activeObjectMetadataItems.find(
      (activeObjectMetadataItem) =>
        activeObjectMetadataItem.namePlural === namePlural,
    );

  const findObjectMetadataItemById = (id: string) =>
    objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.id === id,
    );

  const findObjectMetadataItemByNamePlural = (namePlural: string) =>
    objectMetadataItems.find(
      (objectMetadataItem) => objectMetadataItem.namePlural === namePlural,
    );

  return {
    activeObjectMetadataItems,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
    findActiveObjectMetadataItemByNamePlural,
    inactiveObjectMetadataItems,
    objectMetadataItems,
    alphaSortedActiveObjectMetadataItems,
  };
};
