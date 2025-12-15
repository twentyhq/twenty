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
  const fieldMetadataItemsMap = new Map(
    availableFieldMetadataItems.map((field) => [field.id, field]),
  );

  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  const sectionsWithFields = sortedSections
    .map((section) => {
      const sortedFields = [...section.fields].sort(
        (a, b) => a.position - b.position,
      );

      const visibleFields = sortedFields
        .map((fieldConfig) => {
          const fieldMetadataItem = fieldMetadataItemsMap.get(
            fieldConfig.fieldMetadataId,
          );

          if (!isDefined(fieldMetadataItem)) {
            return null;
          }

          const isVisible = evaluateWidgetVisibility({
            conditionalDisplay: fieldConfig.conditionalDisplay,
            context,
          });

          if (!isVisible) {
            return null;
          }

          return fieldMetadataItem;
        })
        .filter(isDefined);

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
