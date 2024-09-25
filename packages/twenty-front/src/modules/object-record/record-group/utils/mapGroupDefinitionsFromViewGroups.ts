import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionNoValue,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewGroup } from '@/views/types/ViewGroup';
import { IconSettings } from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const mapGroupDefinitionsFromViewGroups = ({
  viewGroups,
  objectMetadataItem,
  navigateToSelectSettings,
}: {
  viewGroups: ViewGroup[];
  objectMetadataItem: ObjectMetadataItem;
  navigateToSelectSettings: () => void;
}): {
  fieldMetadataItem: FieldMetadataItem | null;
  groupDefinitions: RecordGroupDefinition[];
} => {
  if (viewGroups.length === 0) {
    return {
      fieldMetadataItem: null,
      groupDefinitions: [],
    };
  }

  const fieldMetadataId = viewGroups?.[0]?.fieldMetadataId;
  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) =>
      field.id === fieldMetadataId && field.type === FieldMetadataType.Select,
  );

  if (!selectFieldMetadataItem) {
    return {
      fieldMetadataItem: null,
      groupDefinitions: [],
    };
  }

  if (!selectFieldMetadataItem.options) {
    throw new Error(
      `Select Field ${objectMetadataItem.nameSingular} has no options`,
    );
  }

  const groupDefinitions =
    viewGroups
      .map((viewGroup) => {
        const selectedOption = selectFieldMetadataItem.options!.find(
          (option) => option.value === viewGroup.fieldValue,
        );

        if (!selectedOption) return null;

        return {
          id: viewGroup.id,
          fieldMetadataId: viewGroup.fieldMetadataId,
          type: RecordGroupDefinitionType.Value,
          title: selectedOption.label,
          value: selectedOption.value,
          color: selectedOption.color,
          position: viewGroup.position,
          isVisible: viewGroup.isVisible,
          actions: [
            {
              id: 'edit',
              label: 'Edit from Settings',
              icon: IconSettings,
              position: 0,
              callback: () => {
                navigateToSelectSettings();
              },
            },
          ],
        } satisfies RecordGroupDefinition;
      })
      .filter(isDefined)
      .sort((a, b) => a.position - b.position) ?? [];

  if (selectFieldMetadataItem.isNullable === true) {
    const noValueColumn = {
      id: 'no-value',
      title: 'No Value',
      type: RecordGroupDefinitionType.NoValue,
      value: null,
      actions: [],
      position:
        groupDefinitions
          .map((option) => option.position)
          .reduce((a, b) => Math.max(a, b), 0) + 1,
      isVisible: true,
    } satisfies RecordGroupDefinitionNoValue;

    return {
      fieldMetadataItem: selectFieldMetadataItem,
      groupDefinitions: [...groupDefinitions, noValueColumn],
    };
  }

  return {
    fieldMetadataItem: selectFieldMetadataItem,
    groupDefinitions,
  };
};
