import { isDefined } from '~/utils/isDefined';

import { ViewGroup } from '@/views/types/ViewGroup';
import {
  RecordGroupDefinition,
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
  // const groupDefinitionsById = mapArrayToObject(
  //   groupDefinitions,
  //   ({ id }) => id,
  // );

  const groupDefinitionsFromViewGroups = viewGroups
    .map((viewGroup) => {
      // const correspondingGroupDefinition = groupDefinitionsById[viewGroup.id];

      // if (isUndefinedOrNull(correspondingGroupDefinition)) return null;

      const selectFieldMetadataItem = objectMetadataItem.fields.find(
        (field) =>
          field.id === viewGroup.fieldMetadataId &&
          // TODO: Only Select type for now, but we should support other types
          field.type === FieldMetadataType.Select,
      );

      if (!selectFieldMetadataItem) return null;

      if (!selectFieldMetadataItem.options) {
        throw new Error(
          `Select Field ${objectMetadataItem.nameSingular} has no options`,
        );
      }

      const selectedOption = selectFieldMetadataItem.options.find(
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
        actions: [],
      } as RecordGroupDefinition;
    })
    .filter(isDefined)
    .sort((a, b) => a.position - b.position);

  return groupDefinitionsFromViewGroups;
};
