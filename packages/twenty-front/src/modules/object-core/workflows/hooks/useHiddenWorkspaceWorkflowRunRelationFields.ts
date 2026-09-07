import { useMemo } from 'react';
import { FeatureFlagKey } from 'twenty-shared/types';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useHiddenWorkspaceWorkflowRunRelationFields = (
  objectNameSingular: string | undefined,
) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  return useMemo(
    () =>
      (
        objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.nameSingular === objectNameSingular,
        )?.fields ?? []
      )
        .filter((field) =>
          isHiddenWorkspaceWorkflowRunRelationField({
            objectNameSingular,
            fieldName: field.name,
            isWorkflowCoreIndexPageEnabled,
          }),
        )
        .flatMap((field) => [field.id, field.name]),
    [objectMetadataItems, objectNameSingular, isWorkflowCoreIndexPageEnabled],
  );
};
