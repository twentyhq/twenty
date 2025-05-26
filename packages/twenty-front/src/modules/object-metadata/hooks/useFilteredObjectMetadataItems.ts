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

  const activeNonSystemObjectMetadataItems = useMemo(
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
