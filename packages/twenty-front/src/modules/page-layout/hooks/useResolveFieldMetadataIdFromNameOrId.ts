import { doesFieldMetadataItemMatchFieldMetadataId } from '@/object-metadata/utils/doesFieldMetadataItemMatchFieldMetadataId';
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

  // Only one field per morph group is served, so a sibling id resolves to its group's field.
  return useMemo(
    () =>
      objectMetadataItem.fields.find(
        (field) =>
          field.name === fieldMetadataIdOrName ||
          doesFieldMetadataItemMatchFieldMetadataId({
            fieldMetadataItem: field,
            fieldMetadataId: fieldMetadataIdOrName,
          }),
      )?.id,
    [objectMetadataItem.fields, fieldMetadataIdOrName],
  );
};
