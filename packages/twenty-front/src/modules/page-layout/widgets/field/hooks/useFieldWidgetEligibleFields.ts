import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { useMemo } from 'react';

export const useFieldWidgetEligibleFields = (objectNameSingular: string) => {
  const {
    boxedRelationFieldMetadataItems,
    junctionRelationFieldMetadataItems,
    inlineFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
    // Allow advanced relation fields targeting system objects (e.g. calendarEventParticipants)
    // to appear in the FieldWidget selector — the widget can render them as boxed relations.
    includeSystemObjectRelations: true,
  });

  return useMemo(() => {
    const eligibleInlineFields = inlineFieldMetadataItems.filter(
      (field) => !isJunctionRelationField(field),
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
