import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { isDefined } from 'twenty-shared/utils';

export const computeFieldsWidgetFieldDiff = (
  persistedGroups: FieldsWidgetGroup[],
  draftGroups: FieldsWidgetGroup[],
) => {
  const fieldUpdates: Array<{
    viewFieldId: string;
    isVisible?: boolean;
    position?: number;
    viewFieldGroupId?: string;
  }> = [];

  const persistedFieldMap = new Map<
    string,
    {
      isVisible: boolean;
      position: number;
      groupId: string;
    }
  >();

  for (const group of persistedGroups) {
    for (const field of group.fields) {
      if (isDefined(field.viewFieldId)) {
        persistedFieldMap.set(field.viewFieldId, {
          isVisible: field.isVisible,
          position: field.position,
          groupId: group.id,
        });
      }
    }
  }

  for (const draftGroup of draftGroups) {
    for (const draftField of draftGroup.fields) {
      if (!isDefined(draftField.viewFieldId)) {
        continue;
      }

      const persistedField = persistedFieldMap.get(draftField.viewFieldId);

      if (!isDefined(persistedField)) {
        continue;
      }

      const hasVisibilityChange =
        persistedField.isVisible !== draftField.isVisible;
      const hasPositionChange = persistedField.position !== draftField.position;
      const hasGroupChange = persistedField.groupId !== draftGroup.id;

      if (hasVisibilityChange || hasPositionChange || hasGroupChange) {
        fieldUpdates.push({
          viewFieldId: draftField.viewFieldId,
          ...(hasVisibilityChange ? { isVisible: draftField.isVisible } : {}),
          ...(hasPositionChange ? { position: draftField.position } : {}),
          ...(hasGroupChange ? { viewFieldGroupId: draftGroup.id } : {}),
        });
      }
    }
  }

  return fieldUpdates;
};
