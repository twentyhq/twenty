import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { isJunctionRelationField } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationField';
import { FIELD_WIDGET_SUPPORTED_FIELD_TYPES } from '@/page-layout/widgets/field/constants/fieldWidgetSupportedFieldTypes';
import { useMemo } from 'react';

export const useFieldWidgetEligibleFields = (objectNameSingular: string) => {
  const {
    boxedRelationFieldMetadataItems,
    junctionRelationFieldMetadataItems,
    inlineFieldMetadataItems,
  } = useFieldListFieldMetadataItems({ objectNameSingular });

  return useMemo(() => {
    const eligibleInlineFields = inlineFieldMetadataItems.filter(
      (field) =>
        FIELD_WIDGET_SUPPORTED_FIELD_TYPES.includes(field.type) &&
        !isJunctionRelationField(field),
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
