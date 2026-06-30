import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type FieldsWidgetGroup,
  type FieldsWidgetGroupField,
} from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { isDefined } from 'twenty-shared/utils';

type BuildResult = {
  editorMode: FieldsWidgetEditorMode;
  groups: FieldsWidgetGroup[];
  ungroupedFields: FieldsWidgetGroupField[];
};

export const buildFieldsWidgetGroupsFromFlatViewData = ({
  flatViewFieldGroups,
  flatViewFields,
  fieldMetadataItems,
}: {
  flatViewFieldGroups: FlatViewFieldGroup[];
  flatViewFields: FlatViewField[];
  fieldMetadataItems: FieldMetadataItem[];
}): BuildResult => {
  const fieldMetadataById = new Map(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  if (flatViewFieldGroups.length > 0) {
    const groups = flatViewFieldGroups.map((group) => ({
      id: group.id,
      name: group.name,
      position: group.position,
      isVisible: group.isVisible,
      fields: flatViewFields
        .filter((field) => field.viewFieldGroupId === group.id)
        .sort((a, b) => a.position - b.position)
        .map((field, index) => {
          const fieldMetadataItem = fieldMetadataById.get(
            field.fieldMetadataId,
          );

          if (!isDefined(fieldMetadataItem)) {
            return undefined;
          }

          return {
            fieldMetadataItem,
            position: field.position,
            isVisible: field.isVisible,
            globalIndex: index,
          };
        })
        .filter(isDefined),
    }));

    return { editorMode: 'grouped', groups, ungroupedFields: [] };
  }

  const ungroupedFields = flatViewFields
    .sort((a, b) => a.position - b.position)
    .map((field, index) => {
      const fieldMetadataItem = fieldMetadataById.get(field.fieldMetadataId);

      if (!isDefined(fieldMetadataItem)) {
        return undefined;
      }

      return {
        fieldMetadataItem,
        position: field.position,
        isVisible: field.isVisible,
        globalIndex: index,
      };
    })
    .filter(isDefined);

  return { editorMode: 'ungrouped', groups: [], ungroupedFields };
};
