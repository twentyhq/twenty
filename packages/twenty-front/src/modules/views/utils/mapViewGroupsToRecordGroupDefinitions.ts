import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const mapViewGroupsToRecordGroupDefinitions = ({
  mainGroupByFieldMetadataId,
  objectMetadataItem,
  viewGroups,
}: {
  mainGroupByFieldMetadataId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  viewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  const groupByFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === mainGroupByFieldMetadataId,
  );

  if (!isDefined(groupByFieldMetadataItem)) {
    return [];
  }

  if (isManyToOneRelationField(groupByFieldMetadataItem)) {
    return [];
  }

  if (viewGroups?.length === 0) {
    return [];
  }

  const selectFieldMetadataItem =
    groupByFieldMetadataItem.type === FieldMetadataType.SELECT
      ? groupByFieldMetadataItem
      : undefined;

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

      if (
        !selectedOption &&
        isDefined(viewGroup.fieldValue) &&
        viewGroup.fieldValue !== ''
      ) {
        return null;
      }

      if (!selectedOption && selectFieldMetadataItem.isNullable === false) {
        return null;
      }

      return {
        id: viewGroup.id,
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
