import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { isDefined } from 'twenty-shared/utils';

export const computeFieldsWidgetGroupDiff = (
  persistedGroups: FieldsWidgetGroup[],
  draftGroups: FieldsWidgetGroup[],
) => {
  const persistedGroupIds = new Set(persistedGroups.map((g) => g.id));
  const draftGroupIds = new Set(draftGroups.map((g) => g.id));

  const createdGroups = draftGroups.filter((g) => !persistedGroupIds.has(g.id));

  const deletedGroups = persistedGroups.filter((g) => !draftGroupIds.has(g.id));

  const updatedGroups = draftGroups.filter((draftGroup) => {
    if (!persistedGroupIds.has(draftGroup.id)) {
      return false;
    }

    const persistedGroup = persistedGroups.find((g) => g.id === draftGroup.id);

    if (!isDefined(persistedGroup)) {
      return false;
    }

    return (
      persistedGroup.name !== draftGroup.name ||
      persistedGroup.position !== draftGroup.position ||
      persistedGroup.isVisible !== draftGroup.isVisible
    );
  });

  return { createdGroups, deletedGroups, updatedGroups };
};
