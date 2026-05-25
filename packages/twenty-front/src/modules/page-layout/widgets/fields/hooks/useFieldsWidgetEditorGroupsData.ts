import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { buildDefaultFieldsWidgetGroups } from '@/page-layout/widgets/fields/utils/buildDefaultFieldsWidgetGroups';
import { useViewById } from '@/views/hooks/useViewById';
import { useMemo } from 'react';
import {
  isDefined,
  isFieldMetadataEligibleForFieldsWidget,
  isNonEmptyArray,
} from 'twenty-shared/utils';

type UseFieldsWidgetEditorGroupsDataParams = {
  viewId: string | null;
  objectNameSingular: string;
};

type UseFieldsWidgetEditorGroupsDataResult = {
  groups: FieldsWidgetGroup[];
  ungroupedFields: FieldsWidgetGroupField[];
  editorMode: FieldsWidgetEditorMode;
  isFromView: boolean;
};

export const useFieldsWidgetEditorGroupsData = ({
  viewId,
  objectNameSingular,
}: UseFieldsWidgetEditorGroupsDataParams) => {
  const { view } = useViewById(viewId);
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const result = useMemo<
    Pick<
      UseFieldsWidgetEditorGroupsDataResult,
      'groups' | 'ungroupedFields' | 'editorMode'
    >
  >(() => {
    if (!isDefined(objectMetadataItem)) {
      return { groups: [], ungroupedFields: [], editorMode: 'ungrouped' };
    }

    const activeFields = objectMetadataItem.fields.filter(
      (field) => field.isActive,
    );

    const eligibleFieldMetadataIds = new Set(
      activeFields
        .filter((field) =>
          isFieldMetadataEligibleForFieldsWidget({
            fieldName: field.name,
            fieldType: field.type,
            isLabelIdentifierField:
              field.id === labelIdentifierFieldMetadataItem?.id,
          }),
        )
        .map((field) => field.id),
    );

    const buildMissingFields = ({
      existingFieldMetadataIds,
      startGlobalIndex,
      startPosition,
    }: {
      existingFieldMetadataIds: Set<string>;
      startGlobalIndex: number;
      startPosition: number;
    }): FieldsWidgetGroupField[] => {
      let globalIndex = startGlobalIndex;
      let position = startPosition;

      return activeFields
        .filter(
          (field) =>
            !existingFieldMetadataIds.has(field.id) &&
            eligibleFieldMetadataIds.has(field.id),
        )
        .map((field) => ({
          fieldMetadataItem: field,
          position: position++,
          isVisible: false,
          globalIndex: globalIndex++,
        }));
    };

    if (isDefined(view) && isNonEmptyArray(view.viewFieldGroups)) {
      const viewFieldGroups = view.viewFieldGroups;

      const sortedGroups = [...viewFieldGroups].sort(
        (a, b) => a.position - b.position,
      );

      let globalIndex = 0;
      const existingFieldMetadataIds = new Set<string>();

      const groups = sortedGroups.map((group) => {
        const groupFields = [...(group.viewFields ?? [])].sort(
          (a, b) => a.position - b.position,
        );

        const fields: FieldsWidgetGroupField[] = groupFields
          .map((viewField) => {
            const fieldMetadataItem = activeFields.find(
              (f) => f.id === viewField.fieldMetadataId,
            );

            if (!isDefined(fieldMetadataItem)) {
              return null;
            }

            existingFieldMetadataIds.add(viewField.fieldMetadataId);

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

      const lastGroup = groups[groups.length - 1];
      const lastFieldPosition =
        lastGroup.fields.length > 0
          ? Math.max(...lastGroup.fields.map((f) => f.position)) + 1
          : 0;

      const missingFields = buildMissingFields({
        existingFieldMetadataIds,
        startGlobalIndex: globalIndex,
        startPosition: lastFieldPosition,
      });

      if (missingFields.length > 0) {
        lastGroup.fields = [...lastGroup.fields, ...missingFields];
      }

      return { groups, ungroupedFields: [], editorMode: 'grouped' };
    }

    if (isDefined(view) && view.viewFields.length > 0) {
      let globalIndex = 0;
      const existingFieldMetadataIds = new Set<string>();

      const fields = [...view.viewFields]
        .sort((a, b) => a.position - b.position)
        .map((viewField) => {
          const fieldMetadataItem = activeFields.find(
            (f) => f.id === viewField.fieldMetadataId,
          );

          if (!isDefined(fieldMetadataItem)) {
            return null;
          }

          existingFieldMetadataIds.add(viewField.fieldMetadataId);

          return {
            fieldMetadataItem,
            position: viewField.position,
            isVisible: viewField.isVisible,
            globalIndex: globalIndex++,
            viewFieldId: viewField.id,
          };
        })
        .filter(isDefined);

      const lastFieldPosition =
        fields.length > 0 ? Math.max(...fields.map((f) => f.position)) + 1 : 0;

      const missingFields = buildMissingFields({
        existingFieldMetadataIds,
        startGlobalIndex: globalIndex,
        startPosition: lastFieldPosition,
      });

      const allFields = [...fields, ...missingFields];

      if (allFields.length > 0) {
        return {
          groups: [],
          ungroupedFields: allFields,
          editorMode: 'ungrouped',
        };
      }
    }

    return {
      groups: buildDefaultFieldsWidgetGroups({
        fields: objectMetadataItem.fields,
        labelIdentifierFieldMetadataItemId:
          labelIdentifierFieldMetadataItem?.id,
      }),
      ungroupedFields: [],
      editorMode: 'grouped' as const,
    };
  }, [objectMetadataItem, view, labelIdentifierFieldMetadataItem]);

  return {
    ...result,
    isFromView:
      isDefined(view) &&
      (isDefined(view.viewFieldGroups) || view.viewFields.length > 0),
  };
};
