import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';

export const getLastGroupId = (groups: FieldsWidgetGroup[]): string | null => {
  if (groups.length === 0) {
    return null;
  }

  const sortedGroups = [...groups].sort((a, b) => a.position - b.position);

  return sortedGroups[sortedGroups.length - 1].id;
};
