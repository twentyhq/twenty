import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useGetViewById } from '@/views/hooks/useGetViewById';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseFieldsWidgetGroupsParams = {
  viewId: string | null;
  objectNameSingular: string;
};

export const useFieldsWidgetGroups = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetGroupsParams) => {
  const { t } = useLingui();
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

      return sortedGroups
        .filter((group) => group.isVisible)
        .map((group) => {
          // Get fields belonging to this group (nested in the group)
          const groupFields = [...(group.viewFields ?? [])].sort(
            (a, b) => a.position - b.position,
          );

          const fields: FieldsWidgetGroupField[] = groupFields
            .filter((field) => field.isVisible)
            .map((viewField) => {
              const fieldMetadataItem = objectMetadataItem.fields.find(
                (f) => f.id === viewField.fieldMetadataId,
              );

              if (!isDefined(fieldMetadataItem)) {
                return null;
              }

              const field: FieldsWidgetGroupField = {
                fieldMetadataItem,
                position: viewField.position,
                isVisible: viewField.isVisible,
                globalIndex: globalIndex++,
              };

              return field;
            })
            .filter(isDefined);

          return {
            id: group.id,
            name: group.name,
            position: group.position,
            isVisible: group.isVisible,
            fields,
          };
        })
        .filter((group) => group.fields.length > 0);
    }

    // Fallback: generate temporary groups from object metadata
    const fieldsToDisplay = objectMetadataItem.fields;

    if (fieldsToDisplay.length === 0) {
      return [];
    }

    const generalFields: Array<{
      fieldMetadataItem: (typeof fieldsToDisplay)[0];
      position: number;
    }> = [];
    const otherFields: Array<{
      fieldMetadataItem: (typeof fieldsToDisplay)[0];
      position: number;
    }> = [];

    let generalPosition = 0;
    let otherPosition = 0;

    fieldsToDisplay.forEach((field) => {
      if (field.isCustom === true) {
        otherFields.push({
          fieldMetadataItem: field,
          position: otherPosition++,
        });
      } else {
        generalFields.push({
          fieldMetadataItem: field,
          position: generalPosition++,
        });
      }
    });

    const groups: FieldsWidgetGroup[] = [];
    let globalIndex = 0;

    if (generalFields.length > 0) {
      groups.push({
        id: `${objectNameSingular}-group-general`,
        name: t`General`,
        position: 0,
        isVisible: true,
        fields: generalFields.map((field) => ({
          fieldMetadataItem: field.fieldMetadataItem,
          position: field.position,
          isVisible: true,
          globalIndex: globalIndex++,
        })),
      });
    }

    if (otherFields.length > 0) {
      groups.push({
        id: `${objectNameSingular}-group-other`,
        name: t`Other`,
        position: 1,
        isVisible: true,
        fields: otherFields.map((field) => ({
          fieldMetadataItem: field.fieldMetadataItem,
          position: field.position,
          isVisible: true,
          globalIndex: globalIndex++,
        })),
      });
    }

    return groups;
  }, [objectMetadataItem, objectNameSingular, t, view]);

  return {
    groups,
    isFromView: isDefined(view) && isDefined(view.viewFieldGroups),
  };
};
