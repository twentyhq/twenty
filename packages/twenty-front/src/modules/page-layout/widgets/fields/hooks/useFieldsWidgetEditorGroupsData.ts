import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useGetViewById } from '@/views/hooks/useGetViewById';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseFieldsWidgetEditorGroupsDataParams = {
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetEditorGroupsData = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetEditorGroupsDataParams) => {
  const { view } = useGetViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    // If we have a view with viewFieldGroups, use them
    if (isDefined(view) && isDefined(view.viewFieldGroups)) {
      const viewFieldGroups = view.viewFieldGroups;

      const sortedGroups = [...viewFieldGroups].sort(
        (a, b) => a.position - b.position,
      );

      let globalIndex = 0;

      return sortedGroups.map((group) => {
        // Get fields belonging to this group (nested in the group)
        const groupFields = [...(group.viewFields ?? [])].sort(
          (a, b) => a.position - b.position,
        );

        const fields = groupFields
          .map((viewField) => {
            const fieldMetadataItem = objectMetadataItem.fields.find(
              (f) => f.id === viewField.fieldMetadataId,
            );

            if (!isDefined(fieldMetadataItem)) {
              return null;
            }

            return {
              fieldMetadataItem,
              position: viewField.position,
              isVisible: viewField.isVisible,
              globalIndex: globalIndex++,
              viewFieldId: viewField.id,
            };
          })
          .filter(isDefined);

        return {
          id: group.id,
          name: group.name,
          position: group.position,
          isVisible: group.isVisible,
          fields,
        };
      });
    }

    // Fallback: generate empty groups (no view configured)
    return [];
  }, [objectMetadataItem, view]);

  return {
    groups,
    isFromView: isDefined(view) && isDefined(view.viewFieldGroups),
  };
};
