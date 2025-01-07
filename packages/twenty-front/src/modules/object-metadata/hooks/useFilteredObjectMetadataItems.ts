import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

import { getObjectSlug } from '../utils/getObjectSlug';

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

  const findObjectMetadataItemBySlug = (slug: string) =>
    objectMetadataItems.find(
      (objectMetadataItem) => getObjectSlug(objectMetadataItem) === slug,
    );

  const findActiveObjectMetadataItemBySlug = (slug: string) =>
    activeObjectMetadataItems.find(
      (activeObjectMetadataItem) =>
        getObjectSlug(activeObjectMetadataItem) === slug,
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
    findActiveObjectMetadataItemBySlug,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
    findActiveObjectMetadataItemByNamePlural,
    inactiveObjectMetadataItems,
    objectMetadataItems,
    findObjectMetadataItemBySlug,
    alphaSortedActiveObjectMetadataItems,
  };
};
