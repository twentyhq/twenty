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
const NO_VALUE_ORDER_KEY = '__no_value__';

type GroupByResultGroup = RecordGqlConnectionEdgesRequired & {
  groupByDimensionValues: (string | null)[];
};

export type RelationRecordGroupOrder = {
  value: string | null;
  viewGroupId?: string;
  isVisible: boolean;
  position: number;
};

export const buildRelationRecordGroupDefinitions = ({
  groups,
  relationFieldName,
  mainGroupByFieldMetadataId,
  targetObjectMetadataItem,
  priorOrder,
}: {
  groups: GroupByResultGroup[];
  relationFieldName: string;
  mainGroupByFieldMetadataId: string;
  targetObjectMetadataItem: EnrichedObjectMetadataItem | undefined;
  priorOrder: RelationRecordGroupOrder[];
}): RecordGroupDefinition[] => {
  const priorOrderByKey = new Map(
    priorOrder.map((order) => [order.value ?? NO_VALUE_ORDER_KEY, order]),
  );

  type DraftGroup = { definition: RecordGroupDefinition; orderRank: number };
  const draftGroups: DraftGroup[] = [];
  const seenValues = new Set<string>();
  let hasNoValueGroup = false;

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
    const relationRecord: ObjectRecord | undefined =
      records[0]?.[relationFieldName];

    const title =
      isDefined(relationRecord) && isDefined(targetObjectMetadataItem)
        ? getObjectRecordIdentifier({
            objectMetadataItem: targetObjectMetadataItem,
            record: relationRecord,
            allowRequestsToTwentyIcons: false,
          }).name
        : groupValue;

    const prior = priorOrderByKey.get(groupValue);

    draftGroups.push({
      definition: {
        id: groupValue,
        type: RecordGroupDefinitionType.Value,
        title,
        value: groupValue,
        color: 'transparent',
        position: 0,
        isVisible: prior?.isVisible ?? true,
        relationRecord,
        viewGroupId: prior?.viewGroupId,
      },
      orderRank: prior?.position ?? Number.MAX_SAFE_INTEGER - 1,
    });
  }

  if (hasNoValueGroup) {
    const prior = priorOrderByKey.get(NO_VALUE_ORDER_KEY);

    draftGroups.push({
      definition: {
        id: `${mainGroupByFieldMetadataId}-${NO_VALUE_RECORD_GROUP_ID_SUFFIX}`,
        type: RecordGroupDefinitionType.NoValue,
        title: 'No Value',
        value: null,
        color: 'transparent',
        position: 0,
        isVisible: prior?.isVisible ?? true,
        viewGroupId: prior?.viewGroupId,
      },
      orderRank: prior?.position ?? Number.MAX_SAFE_INTEGER,
    });
  }

  return draftGroups
    .sort((a, b) => {
      if (a.orderRank !== b.orderRank) {
        return a.orderRank - b.orderRank;
      }
      return a.definition.title.localeCompare(b.definition.title);
    })
    .map(({ definition }, index) => ({ ...definition, position: index }));
};
