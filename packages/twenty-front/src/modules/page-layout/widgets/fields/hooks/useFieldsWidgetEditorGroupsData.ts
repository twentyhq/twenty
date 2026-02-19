import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useGetViewById } from '@/views/hooks/useGetViewById';
import { useLingui } from '@lingui/react/macro';
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
  const { t } = useLingui();
  const { view } = useGetViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const groups = useMemo<FieldsWidgetGroup[]>(() => {
    if (!isDefined(objectMetadataItem)) {
      return [];
    }

    if (isDefined(view) && isDefined(view.viewFieldGroups)) {
      const viewFieldGroups = view.viewFieldGroups;

      const sortedGroups = [...viewFieldGroups].sort(
        (a, b) => a.position - b.position,
      );

      let globalIndex = 0;

      return sortedGroups.map((group) => {
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

    if (isDefined(view) && view.viewFields.length > 0) {
      let globalIndex = 0;

      const fields = [...view.viewFields]
        .sort((a, b) => a.position - b.position)
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

      if (fields.length > 0) {
        return [
          {
            id: `${view.id}-group-general`,
            name: t`General`,
            position: 0,
            isVisible: true,
            fields,
          },
        ];
      }
    }

    return [];
  }, [objectMetadataItem, t, view]);

  return {
    groups,
    isFromView:
      isDefined(view) &&
      (isDefined(view.viewFieldGroups) || view.viewFields.length > 0),
  };
};
