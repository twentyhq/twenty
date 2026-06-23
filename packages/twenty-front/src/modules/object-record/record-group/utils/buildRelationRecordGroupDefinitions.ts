import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlConnectionEdgesRequired } from '@/object-record/graphql/types/RecordGqlConnectionEdgesRequired';
import {
  type RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

const NO_VALUE_RECORD_GROUP_ID_SUFFIX = 'no-value';

type GroupByResultGroup = RecordGqlConnectionEdgesRequired & {
  groupByDimensionValues: (string | null)[];
};

export const buildRelationRecordGroupDefinitions = ({
  groups,
  relationFieldName,
  mainGroupByFieldMetadataId,
  targetObjectMetadataItem,
}: {
  groups: GroupByResultGroup[];
  relationFieldName: string;
  mainGroupByFieldMetadataId: string;
  targetObjectMetadataItem: EnrichedObjectMetadataItem | undefined;
}): RecordGroupDefinition[] => {
  let hasNoValueGroup = false;
  const seenValues = new Set<string>();
  const valueGroupDefinitions: RecordGroupDefinition[] = [];

  for (const group of groups) {
    const groupValue = group.groupByDimensionValues?.[0] ?? null;

    if (!isDefined(groupValue)) {
      hasNoValueGroup = true;
      continue;
    }

    if (seenValues.has(groupValue)) {
      continue;
    }
    seenValues.add(groupValue);

    const records = getRecordsFromRecordConnection({ recordConnection: group });
    const relationRecord = records[0]?.[relationFieldName] as
      | ObjectRecord
      | undefined;

    const title =
      isDefined(relationRecord) && isDefined(targetObjectMetadataItem)
        ? getObjectRecordIdentifier({
            objectMetadataItem: targetObjectMetadataItem,
            record: relationRecord,
            allowRequestsToTwentyIcons: false,
          }).name
        : groupValue;

    valueGroupDefinitions.push({
      id: groupValue,
      type: RecordGroupDefinitionType.Value,
      title,
      value: groupValue,
      color: 'transparent',
      position: 0,
      isVisible: true,
      relationRecord,
    });
  }

  const sortedValueGroupDefinitions = valueGroupDefinitions
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((groupDefinition, index) => ({
      ...groupDefinition,
      position: index,
    }));

  if (!hasNoValueGroup) {
    return sortedValueGroupDefinitions;
  }

  return [
    ...sortedValueGroupDefinitions,
    {
      id: `${mainGroupByFieldMetadataId}-${NO_VALUE_RECORD_GROUP_ID_SUFFIX}`,
      type: RecordGroupDefinitionType.NoValue,
      title: 'No Value',
      value: null,
      color: 'transparent',
      position: sortedValueGroupDefinitions.length,
      isVisible: true,
    },
  ];
};
