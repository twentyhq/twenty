import { useFieldsWidgetSectionsWithFields } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetSectionsWithFields';

export const useFieldsWidgetFlattenedFields = (objectNameSingular: string) => {
  const { sectionsWithFields } =
    useFieldsWidgetSectionsWithFields(objectNameSingular);

  const flattenedFieldMetadataItems = sectionsWithFields.flatMap(
    (section) => section.fields,
  );

  return { flattenedFieldMetadataItems };
};
