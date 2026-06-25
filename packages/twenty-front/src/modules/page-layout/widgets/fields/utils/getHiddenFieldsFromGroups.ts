import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

export const getHiddenFieldsFromGroups = (
  groups: FieldsWidgetGroup[],
): FieldsWidgetGroupField[] => {
  const sortedGroups = [...groups].sort((a, b) => a.position - b.position);

  let globalIndex = 0;
  const result: FieldsWidgetGroupField[] = [];

  for (const group of sortedGroups) {
    const sortedFields = [...group.fields].sort(
      (a, b) => a.position - b.position,
    );

    for (const field of sortedFields) {
      if (field.isVisible && group.isVisible) {
        continue;
      }

      result.push({
        ...field,
        isVisible: false,
        globalIndex: globalIndex++,
      });
    }
  }

  return result;
};
