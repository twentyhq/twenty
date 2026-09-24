import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { useMemo } from 'react';

export const useResolveFieldMetadataIdFromNameOrId = (
  fieldMetadataIdOrName: string,
): string | undefined => {
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  return useMemo(() => {
    const fieldByName = objectMetadataItem.fields.find(
      (field) => field.name === fieldMetadataIdOrName,
    );

    if (fieldByName !== undefined) {
      return fieldByName.id;
    }

    const fieldById = objectMetadataItem.fields.find(
      (field) => field.id === fieldMetadataIdOrName,
    );

    if (fieldById !== undefined) {
      return fieldById.id;
    }

    // Only one field per morph group is served, so a widget pointing at
    // another sibling resolves to the field that represents its group.
    const morphGroupField = objectMetadataItem.fields.find((field) =>
      field.morphRelations?.some(
        (morphRelation) =>
          morphRelation.sourceFieldMetadata.id === fieldMetadataIdOrName,
      ),
    );

    return morphGroupField?.id;
  }, [objectMetadataItem.fields, fieldMetadataIdOrName]);
};
