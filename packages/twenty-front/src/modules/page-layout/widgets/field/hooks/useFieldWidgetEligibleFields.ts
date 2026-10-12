import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { useMemo } from 'react';

export const useFieldWidgetEligibleFields = (objectNameSingular: string) => {
  const {
    boxedRelationFieldMetadataItems,
    junctionRelationFieldMetadataItems,
    inlineFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
    // The widget renders relations to system objects (e.g. calendarEventParticipants) as boxed relations.
    includeSystemObjectRelations: true,
  });

  return useMemo(() => {
    const junctionFieldIds = new Set(
      junctionRelationFieldMetadataItems.map(({ id }) => id),
    );
    const eligibleInlineFields = inlineFieldMetadataItems.filter(
      ({ id }) => !junctionFieldIds.has(id),
    );

    return [
      ...boxedRelationFieldMetadataItems,
      ...junctionRelationFieldMetadataItems,
      ...eligibleInlineFields,
    ];
  }, [
    boxedRelationFieldMetadataItems,
    junctionRelationFieldMetadataItems,
    inlineFieldMetadataItems,
  ]);
};
