import { useMemo } from 'react';

import { isHiddenWorkspaceWorkflowRunRelationField } from '@/object-core/workflows/utils/isHiddenWorkspaceWorkflowRunRelationField';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';

// Remove with the workspace workflow and workflowVersion objects, once the
// core migration owns them.
export const useHiddenWorkspaceWorkflowRunRelationFields = (
  objectNameSingular: string | undefined,
) => {
  const { objectMetadataItems } = useObjectMetadataItems();

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
          }),
        )
        .flatMap((field) => [field.id, field.name]),
    [objectMetadataItems, objectNameSingular],
  );
};
