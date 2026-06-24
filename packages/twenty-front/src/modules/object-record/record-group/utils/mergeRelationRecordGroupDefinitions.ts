import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import {
  buildRelationRecordGroupDefinitions,
  type GroupByResultGroup,
  type RelationRecordGroupOrder,
} from '@/object-record/record-group/utils/buildRelationRecordGroupDefinitions';
import { type ViewGroup } from '@/views/types/ViewGroup';
import { isNonEmptyArray } from '@sniptt/guards';

const getPriorOrder = ({
  existingRecordGroupDefinitions,
  persistedViewGroups,
}: {
  existingRecordGroupDefinitions: RecordGroupDefinition[];
  persistedViewGroups: ViewGroup[];
}): RelationRecordGroupOrder[] =>
  isNonEmptyArray(existingRecordGroupDefinitions)
    ? existingRecordGroupDefinitions.map((definition) => ({
        value: definition.value,
        viewGroupId: definition.viewGroupId,
        isVisible: definition.isVisible,
        position: definition.position,
      }))
    : persistedViewGroups.map((viewGroup) => ({
        value: viewGroup.fieldValue === '' ? null : viewGroup.fieldValue,
        viewGroupId: viewGroup.id,
        isVisible: viewGroup.isVisible,
        position: viewGroup.position,
      }));

export const mergeRelationRecordGroupDefinitions = ({
  groups,
  relationFieldName,
  mainGroupByFieldMetadataId,
  targetObjectMetadataItem,
  existingRecordGroupDefinitions,
  persistedViewGroups,
}: {
  groups: GroupByResultGroup[];
  relationFieldName: string;
  mainGroupByFieldMetadataId: string;
  targetObjectMetadataItem: EnrichedObjectMetadataItem | undefined;
  existingRecordGroupDefinitions: RecordGroupDefinition[];
  persistedViewGroups: ViewGroup[];
}): RecordGroupDefinition[] => {
  const builtRecordGroups = buildRelationRecordGroupDefinitions({
    groups,
    relationFieldName,
    mainGroupByFieldMetadataId,
    targetObjectMetadataItem,
    priorOrder: getPriorOrder({
      existingRecordGroupDefinitions,
      persistedViewGroups,
    }),
  });

  const builtRecordGroupValues = new Set(
    builtRecordGroups.map((definition) => definition.value),
  );

  const preservedHiddenRecordGroups = existingRecordGroupDefinitions.filter(
    (definition) =>
      !definition.isVisible && !builtRecordGroupValues.has(definition.value),
  );

  return [...builtRecordGroups, ...preservedHiddenRecordGroups];
};
