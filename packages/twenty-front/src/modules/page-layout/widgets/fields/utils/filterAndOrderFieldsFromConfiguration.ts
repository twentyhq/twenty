import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';
import { isDefined } from 'twenty-shared/utils';

export type FieldsConfigurationSectionWithFields = {
  id: string;
  title: string;
  position: number;
  fields: FieldMetadataItem[];
};

type FilterAndOrderFieldsFromConfigurationParams = {
  configuration: FieldsConfiguration;
  availableFieldMetadataItems: FieldMetadataItem[];
  context: WidgetVisibilityContext;
};

export const filterAndOrderFieldsFromConfiguration = ({
  configuration,
  availableFieldMetadataItems,
  context,
}: FilterAndOrderFieldsFromConfigurationParams): FieldsConfigurationSectionWithFields[] => {
  // Create a map for fast field lookup
  const fieldMetadataItemsMap = new Map(
    availableFieldMetadataItems.map((field) => [field.id, field]),
  );

  // Sort sections by position
  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  // Process each section
  const sectionsWithFields = sortedSections
    .map((section) => {
      // Sort fields by position within the section
      const sortedFields = [...section.fields].sort(
        (a, b) => a.position - b.position,
      );

      // Filter and evaluate conditional display for each field
      const visibleFields = sortedFields
        .map((fieldConfig) => {
          const fieldMetadataItem = fieldMetadataItemsMap.get(
            fieldConfig.fieldMetadataId,
          );

          console.log('fieldMetadataItem', fieldMetadataItem);

          // Skip if field metadata not found
          if (!isDefined(fieldMetadataItem)) {
            return null;
          }

          // Evaluate conditional display
          const isVisible = evaluateWidgetVisibility({
            conditionalDisplay: fieldConfig.conditionalDisplay,
            context,
          });

          console.log('isVisible', isVisible);

          if (!isVisible) {
            return null;
          }

          return fieldMetadataItem;
        })
        .filter(isDefined);

      // Only include sections that have at least one visible field
      if (visibleFields.length === 0) {
        return null;
      }

      return {
        id: section.id,
        title: section.title,
        position: section.position,
        fields: visibleFields,
      };
    })
    .filter(isDefined);

  return sectionsWithFields;
};
