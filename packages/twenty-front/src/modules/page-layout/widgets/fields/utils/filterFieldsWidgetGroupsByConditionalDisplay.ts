import { evaluateConditionalDisplay } from '@/conditional-display/utils/evaluateConditionalDisplay';
import { type WidgetVisibilityContext } from '@/page-layout/types/WidgetVisibilityContext';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

type FilterFieldsWidgetGroupsByConditionalDisplayParams = {
  groups: FieldsWidgetGroup[];
  context: WidgetVisibilityContext;
};

export const filterFieldsWidgetGroupsByConditionalDisplay = ({
  groups,
  context,
}: FilterFieldsWidgetGroupsByConditionalDisplayParams): FieldsWidgetGroup[] => {
  let globalIndex = 0;

  return groups
    .map((group) => ({
      ...group,
      fields: group.fields
        .filter((field) =>
          evaluateConditionalDisplay({
            conditionalDisplay: field.conditionalDisplay,
            context,
            records: context.selectedRecords,
            objectMetadataItem: context.objectMetadataItem,
            objectMetadataItems: context.objectMetadataItems,
          }),
        )
        .map((field) => ({
          ...field,
          globalIndex: globalIndex++,
        })),
    }))
    .filter((group) => group.fields.length > 0);
};
