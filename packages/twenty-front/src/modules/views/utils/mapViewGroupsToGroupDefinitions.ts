import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { ViewGroup } from '@/views/types/ViewGroup';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const mapViewGroupsToGroupDefinitions = ({
  objectMetadataItem,
  groupDefinitions,
  viewGroups,
}: {
  objectMetadataItem: ObjectMetadataItem;
  groupDefinitions: RecordGroupDefinition[];
  viewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  const groupDefinitionsById = mapArrayToObject(
    groupDefinitions,
    ({ id }) => id,
  );

  const groupDefinitionsFromViewGroups = viewGroups
    .map((viewGroup) => {
      const correspondingGroupDefinition = groupDefinitionsById[viewGroup.id];

      if (isUndefinedOrNull(correspondingGroupDefinition)) return null;

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

      return {
        id: viewGroup.id,
        fieldMetadataId: viewGroup.fieldMetadataId,
        type: RecordGroupDefinitionType.Value,
        title: correspondingGroupDefinition.title,
        value: correspondingGroupDefinition.value,
        color:
          'color' in correspondingGroupDefinition
            ? correspondingGroupDefinition.color
            : undefined,
        position: viewGroup.position,
        actions: correspondingGroupDefinition.actions,
      } as RecordGroupDefinition;
    })
    .filter(isDefined);

  return groupDefinitionsFromViewGroups;
};
