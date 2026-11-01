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

  // readableFields already excludes fields the current role has No Access
  // to, so the record page keeps them completely hidden like the table
  // does. Using fields here listed them as empty placeholders instead.
  return useMemo(
    () =>
      isDefined(objectMetadataItem)
        ? objectMetadataItem.readableFields.filter(
            (field) => !hiddenFieldMetadataIdsOrNames.includes(field.name),
          )
        : [],
    [objectMetadataItem, hiddenFieldMetadataIdsOrNames],
  );
};
