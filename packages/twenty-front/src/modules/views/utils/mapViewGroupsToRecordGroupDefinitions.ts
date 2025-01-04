import { isDefined } from '~/utils/isDefined';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { ViewGroup } from '@/views/types/ViewGroup';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const mapViewGroupsToRecordGroupDefinitions = ({
  objectMetadataItem,
  viewGroups,
}: {
  objectMetadataItem: ObjectMetadataItem;
  viewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  if (viewGroups?.length === 0) {
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

  const recordGroupDefinitionsFromViewGroups = viewGroups
    .map((viewGroup) => {
      const selectedOption = selectFieldMetadataItem.options?.find(
        (option) => option.value === viewGroup.fieldValue,
      );

      if (!selectedOption && selectFieldMetadataItem.isNullable === false) {
        return null;
      }

      return {
        id: viewGroup.id,
        fieldMetadataId: viewGroup.fieldMetadataId,
        type: !isDefined(selectedOption)
          ? RecordGroupDefinitionType.NoValue
          : RecordGroupDefinitionType.Value,
        title: selectedOption?.label ?? 'No Value',
        value: selectedOption?.value ?? null,
        color: selectedOption?.color ?? 'transparent',
        position: viewGroup.position,
        isVisible: viewGroup.isVisible,
      } as RecordGroupDefinition;
    })
    .filter(isDefined);

  return recordGroupDefinitionsFromViewGroups.sort(
    (a, b) => a.position - b.position,
  );
};
