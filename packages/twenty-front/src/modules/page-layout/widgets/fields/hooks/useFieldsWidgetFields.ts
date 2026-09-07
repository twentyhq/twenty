import { useHiddenWorkspaceWorkflowRunRelationFields } from '@/object-core/workflows/hooks/useHiddenWorkspaceWorkflowRunRelationFields';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

// Remove with the workspace workflow and workflowVersion objects, once the
// core migration owns them.
export const useFieldsWidgetFields = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
): FieldMetadataItem[] => {
  const hiddenFieldMetadataIdsOrNames =
    useHiddenWorkspaceWorkflowRunRelationFields(
      objectMetadataItem?.nameSingular,
    );

  return useMemo(
    () =>
      isDefined(objectMetadataItem)
        ? objectMetadataItem.fields.filter(
            (field) => !hiddenFieldMetadataIdsOrNames.includes(field.name),
          )
        : [],
    [objectMetadataItem, hiddenFieldMetadataIdsOrNames],
  );
};
