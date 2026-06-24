import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isDefined } from 'twenty-shared/utils';
import { type ThemeColor } from 'twenty-ui/theme';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const NO_VALUE_TITLE = 'No Value';

const isNoValueGroup = (viewGroup: ViewGroup): boolean =>
  !isDefined(viewGroup.fieldValue) || viewGroup.fieldValue === '';

const buildRecordGroupDefinition = ({
  viewGroup,
  isNoValue,
  title,
  value,
  color,
}: {
  viewGroup: ViewGroup;
  isNoValue: boolean;
  title: string;
  value: string | null;
  color: ThemeColor | 'transparent';
}): RecordGroupDefinition => ({
  id: viewGroup.id,
  type: isNoValue
    ? RecordGroupDefinitionType.NoValue
    : RecordGroupDefinitionType.Value,
  title,
  value,
  color,
  position: viewGroup.position,
  isVisible: viewGroup.isVisible,
});

const mapRelationViewGroupsToRecordGroupDefinitions = (
  viewGroups: ViewGroup[],
): RecordGroupDefinition[] =>
  viewGroups.map((viewGroup) => {
    const isNoValue = isNoValueGroup(viewGroup);

    return buildRecordGroupDefinition({
      viewGroup,
      isNoValue,
      title: isNoValue ? NO_VALUE_TITLE : '',
      value: isNoValue ? null : viewGroup.fieldValue,
      color: 'transparent',
    });
  });

const mapSelectViewGroupsToRecordGroupDefinitions = (
  selectFieldMetadataItem: EnrichedObjectMetadataItem['fields'][number],
  viewGroups: ViewGroup[],
): RecordGroupDefinition[] =>
  viewGroups
    .map((viewGroup) => {
      const selectedOption = selectFieldMetadataItem.options?.find(
        (option) => option.value === viewGroup.fieldValue,
      );

      const hasNonEmptyValue =
        isDefined(viewGroup.fieldValue) && viewGroup.fieldValue !== '';

      if (
        !isDefined(selectedOption) &&
        (hasNonEmptyValue || selectFieldMetadataItem.isNullable === false)
      ) {
        return null;
      }

      return buildRecordGroupDefinition({
        viewGroup,
        isNoValue: !isDefined(selectedOption),
        title: selectedOption?.label ?? NO_VALUE_TITLE,
        value: selectedOption?.value ?? null,
        color: selectedOption?.color ?? 'transparent',
      });
    })
    .filter(isDefined);

export const mapViewGroupsToRecordGroupDefinitions = ({
  mainGroupByFieldMetadataId,
  objectMetadataItem,
  viewGroups,
}: {
  mainGroupByFieldMetadataId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  viewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  if (viewGroups.length === 0) {
    return [];
  }

  const groupByFieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === mainGroupByFieldMetadataId,
  );

  if (!isDefined(groupByFieldMetadataItem)) {
    return [];
  }

  let recordGroupDefinitions: RecordGroupDefinition[] = [];

  if (isManyToOneRelationField(groupByFieldMetadataItem)) {
    recordGroupDefinitions =
      mapRelationViewGroupsToRecordGroupDefinitions(viewGroups);
  } else if (groupByFieldMetadataItem.type === FieldMetadataType.SELECT) {
    if (!groupByFieldMetadataItem.options) {
      throw new Error(
        `Select Field ${objectMetadataItem.nameSingular} has no options`,
      );
    }

    recordGroupDefinitions = mapSelectViewGroupsToRecordGroupDefinitions(
      groupByFieldMetadataItem,
      viewGroups,
    );
  }

  return recordGroupDefinitions.sort((a, b) => a.position - b.position);
};
