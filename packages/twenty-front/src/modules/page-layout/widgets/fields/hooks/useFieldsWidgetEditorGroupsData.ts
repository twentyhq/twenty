import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useGetViewById } from '@/views/hooks/useGetViewById';
import { useMemo } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

type UseFieldsWidgetEditorGroupsDataParams = {
  viewId: string | null;
  objectNameSingular: string;
};

type UseFieldsWidgetEditorGroupsDataResult = {
  groups: FieldsWidgetGroup[];
  ungroupedFields: FieldsWidgetGroupField[];
  mode: FieldsWidgetEditorMode;
  isFromView: boolean;
};

export const useFieldsWidgetEditorGroupsData = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetEditorGroupsDataParams): UseFieldsWidgetEditorGroupsDataResult => {
  const { view } = useGetViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const result = useMemo<
    Pick<
      UseFieldsWidgetEditorGroupsDataResult,
      'groups' | 'ungroupedFields' | 'mode'
    >
  >(() => {
    if (!isDefined(objectMetadataItem)) {
      return { groups: [], ungroupedFields: [], mode: 'ungrouped' };
    }

    if (isDefined(view) && isNonEmptyArray(view.viewFieldGroups)) {
      const viewFieldGroups = view.viewFieldGroups;

      const sortedGroups = [...viewFieldGroups].sort(
        (a, b) => a.position - b.position,
      );

      let globalIndex = 0;

      const groups = sortedGroups.map((group) => {
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

      return { groups, ungroupedFields: [], mode: 'grouped' };
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
        return { groups: [], ungroupedFields: fields, mode: 'ungrouped' };
      }
    }

    return { groups: [], ungroupedFields: [], mode: 'ungrouped' };
  }, [objectMetadataItem, view]);

  return {
    ...result,
    isFromView:
      isDefined(view) &&
      (isDefined(view.viewFieldGroups) || view.viewFields.length > 0),
  };
};
