import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

export const filterDraftGroupsForDisplay = (
  draftGroups: FieldsWidgetGroup[],
): FieldsWidgetGroup[] => {
  const sortedGroups = [...draftGroups].sort((a, b) => a.position - b.position);

  let globalIndex = 0;

  return sortedGroups
    .filter((group) => group.isVisible)
    .map((group) => {
      const visibleFields = [...group.fields]
        .sort((a, b) => a.position - b.position)
        .filter((field) => field.isVisible)
        .map((field) => ({
          ...field,
          globalIndex: globalIndex++,
        }));

      return {
        ...group,
        fields: visibleFields,
      };
    })
    .filter((group) => group.fields.length > 0);
};
