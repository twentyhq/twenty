import { isDefined } from '~/utils/isDefined';

import { ViewGroup } from '@/views/types/ViewGroup';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionNoValue,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const mapViewGroupsToGroupDefinitions = ({
  objectMetadataItem,
  viewGroups,
}: {
  objectMetadataItem: ObjectMetadataItem;
  viewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  if (viewGroups.length === 0) {
    return [];
  }

  const fieldMetadataId = viewGroups?.[0]?.fieldMetadataId;
  const selectFieldMetadataItem = objectMetadataItem.fields.find(
    (field) =>
      field.id === fieldMetadataId && field.type === FieldMetadataType.Select,
  );

  if (!selectFieldMetadataItem) {
    return [];
  }

  if (!selectFieldMetadataItem.options) {
    throw new Error(
      `Select Field ${objectMetadataItem.nameSingular} has no options`,
    );
  }
  const groupDefinitionsFromViewGroups = viewGroups
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
      } as RecordGroupDefinition;
    })
    .filter(isDefined)
    .sort((a, b) => a.position - b.position);

  if (selectFieldMetadataItem.isNullable === true) {
    const noValueColumn = {
      id: 'no-value',
      title: 'No Value',
      type: RecordGroupDefinitionType.NoValue,
      value: null,
      position:
        groupDefinitionsFromViewGroups
          .map((option) => option.position)
          .reduce((a, b) => Math.max(a, b), 0) + 1,
      isVisible: true,
    } satisfies RecordGroupDefinitionNoValue;

    return [...groupDefinitionsFromViewGroups, noValueColumn];
  }

  return groupDefinitionsFromViewGroups;
};
