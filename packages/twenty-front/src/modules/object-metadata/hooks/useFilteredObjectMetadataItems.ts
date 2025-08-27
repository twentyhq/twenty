import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useMemo } from 'react';

export const useFilteredObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const activeNonSystemObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter(
        ({ isActive, isSystem }) => isActive && !isSystem,
      ),
    [objectMetadataItems],
  );

  const activeObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems
        .filter(({ isActive }) => isActive)
        .sort((a, b) => a.labelSingular.localeCompare(b.labelSingular)),
    [objectMetadataItems],
  );

  const alphaSortedActiveNonSystemObjectMetadataItems =
    activeNonSystemObjectMetadataItems.sort((a, b) => {
      if (a.nameSingular < b.nameSingular) {
        return -1;
      }
      if (a.nameSingular > b.nameSingular) {
        return 1;
      }
      return 0;
    });

  const inactiveNonSystemObjectMetadataItems = objectMetadataItems.filter(
    ({ isActive, isSystem }) => !isActive && !isSystem,
  );

  const findActiveObjectMetadataItemByNamePlural = (namePlural: string) =>
    activeNonSystemObjectMetadataItems.find(
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
    activeNonSystemObjectMetadataItems,
    activeObjectMetadataItems,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
    findActiveObjectMetadataItemByNamePlural,
    inactiveNonSystemObjectMetadataItems,
    objectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  };
};
