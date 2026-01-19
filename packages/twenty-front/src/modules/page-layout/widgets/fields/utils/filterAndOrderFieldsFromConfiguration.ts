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
  const sortedSections = [...configuration.sections].sort(
    (a, b) => a.position - b.position,
  );

  const sectionsWithFields = sortedSections
    .map((section) => {
      const sectionFieldIds = new Set(
        section.fields.map((f) => f.fieldMetadataId),
      );

      const visibleFields = availableFieldMetadataItems
        .filter((fieldMetadataItem) =>
          sectionFieldIds.has(fieldMetadataItem.id),
        )
        .filter((fieldMetadataItem) => {
          const fieldConfig = section.fields.find(
            (f) => f.fieldMetadataId === fieldMetadataItem.id,
          );

          if (!isDefined(fieldConfig)) {
            return false;
          }

          return evaluateWidgetVisibility({
            conditionalDisplay: fieldConfig.conditionalDisplay,
            context,
          });
        });

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
