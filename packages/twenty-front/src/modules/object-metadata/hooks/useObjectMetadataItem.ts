import { useRecoilValue } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from 'twenty-shared';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { isWorkflowRelatedObjectMetadata } from '@/object-metadata/utils/isWorkflowRelatedObjectMetadata';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

export const useObjectMetadataItem = ({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  // if (!objectNameSingular) { // objectNameSingular is empty, if non-existant object provided
  //   return {
  //     objectMetadataItem: null,
  //   };
  // }
  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

  const isWorkflowToBeFiltered =
    !isWorkflowEnabled && isWorkflowRelatedObjectMetadata(objectNameSingular);

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (isWorkflowToBeFiltered) {
    throw new Error(
      'Workflow is not enabled. If you want to use it, please enable it in the lab.',
    );
  }

  if (!isDefined(objectMetadataItem)) {
    window.location.href = '/not-found';
    throw new ObjectMetadataItemNotFoundError( //Need to remove this but leading to type errors across the code base
      objectNameSingular,
      objectMetadataItems,
    );
  }

  return {
    objectMetadataItem,
  };
};
