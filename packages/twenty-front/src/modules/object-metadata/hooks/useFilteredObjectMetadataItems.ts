import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useMemo } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useFilteredObjectMetadataItems = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const isWorkflowToBeFiltered = useCallback(
    (nameSingular: string) => {
      return (
        !isWorkflowEnabled && isWorkflowRelatedObjectMetadata(nameSingular)
      );
    },
    [isWorkflowEnabled],
  );

  // should naming include that its filtering out workflow related items?
  // but it will be too long
  const activeObjectNonSystemMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter(
        ({ isActive, isSystem, nameSingular }) =>
          isActive && !isSystem && !isWorkflowToBeFiltered(nameSingular),
      ),
    [isWorkflowToBeFiltered, objectMetadataItems],
  );

  const activeObjectMetadataItems = useMemo(
    () =>
      objectMetadataItems.filter(
        ({ isActive, nameSingular }) =>
          isActive && !isWorkflowToBeFiltered(nameSingular),
      ),
    [isWorkflowToBeFiltered, objectMetadataItems],
  );

  const alphaSortedActiveNonSystemObjectMetadataItems =
    activeObjectNonSystemMetadataItems.sort((a, b) => {
      if (a.nameSingular < b.nameSingular) {
        return -1;
      }
      if (a.nameSingular > b.nameSingular) {
        return 1;
      }
      return 0;
    });

  const inactiveObjectNonSystemMetadataItems = objectMetadataItems.filter(
    ({ isActive, isSystem }) => !isActive && !isSystem,
  );

  const findActiveObjectMetadataItemByNamePlural = (namePlural: string) =>
    activeObjectNonSystemMetadataItems.find(
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
    activeObjectNonSystemMetadataItems,
    activeObjectMetadataItems,
    findObjectMetadataItemById,
    findObjectMetadataItemByNamePlural,
    findActiveObjectMetadataItemByNamePlural,
    inactiveObjectNonSystemMetadataItems,
    objectMetadataItems,
    alphaSortedActiveNonSystemObjectMetadataItems,
  };
};
