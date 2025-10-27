import { t } from '@lingui/core/macro';
import { ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { type GroupByDefinition } from 'src/engine/api/graphql/graphql-query-runner/group-by/resolvers/types/group-by-definition.types';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

export const formatResultWithGroupByDimensionValues = ({
  groupsResult,
  groupByDefinitions,
  aggregateFieldNames,
  recordsResult,
  objectMetadataItemWithFieldMaps,
  objectMetadataMaps,
}: {
  groupsResult: Record<string, unknown>[];
  groupByDefinitions: GroupByDefinition[];
  aggregateFieldNames: string[];
  recordsResult?: Array<Record<string, unknown>>;
  objectMetadataItemWithFieldMaps?: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps?: ObjectMetadataMaps;
}): CommonGroupByOutputItem[] => {
  const formattedResult: CommonGroupByOutputItem[] = [];

  const recordsByGroupKey = new Map<string, Array<Record<string, unknown>>>();

  if (isDefined(recordsResult)) {
    if (
      !isDefined(objectMetadataItemWithFieldMaps) ||
      !isDefined(objectMetadataMaps)
    ) {
      throw new Error('Metadata are required to format result');
    }

    recordsResult.forEach((entry) => {
      const groupKey = createGroupKey(entry, groupByDefinitions);

      const records: Record<string, unknown>[] = (
        (entry.records as Array<Record<string, unknown>>) ?? []
      ).map((record) => {
        return formatResult(
          record,
          objectMetadataItemWithFieldMaps,
          objectMetadataMaps,
        );
      });

      recordsByGroupKey.set(groupKey, records);
    });
  }

  groupsResult.forEach((group) => {
    const dimensionValues: unknown[] = [];

    for (const groupByColumn of groupByDefinitions) {
      dimensionValues.push(
        getTranslatedValueIfApplicable(
          group[groupByColumn.alias],
          groupByColumn.dateGranularity,
        ),
      );
    }

    const aggregateValues = aggregateFieldNames.reduce(
      (acc, fieldName) => {
        if (fieldName in group) {
          acc[fieldName] = group[fieldName];
        }

        return acc;
      },
      {} as Record<string, unknown>,
    );

    const groupKey = createGroupKey(group, groupByDefinitions);
    const records = recordsByGroupKey.get(groupKey) || [];

    formattedResult.push({
      ...aggregateValues,
      groupByDimensionValues: dimensionValues,
      ...(isDefined(recordsResult) ? { records } : {}),
    } as CommonGroupByOutputItem);
  });

  return formattedResult;
};

const createGroupKey = (
  group: Record<string, unknown>,
  groupByDefinitions: GroupByDefinition[],
): string => {
  return groupByDefinitions.map((def) => String(group[def.alias])).join('|');
};

const getTranslatedValueIfApplicable = <T>(
  value: T,
  dateGranularity?: ObjectRecordGroupByDateGranularity,
): T | string => {
  if (typeof value !== 'string') {
    return value;
  }

  switch (dateGranularity) {
    case ObjectRecordGroupByDateGranularity.DAY_OF_THE_WEEK:
      switch (value) {
        case 'Monday':
          return t`Monday`;
        case 'Tuesday':
          return t`Tuesday`;
        case 'Wednesday':
          return t`Wednesday`;
        case 'Thursday':
          return t`Thursday`;
        case 'Friday':
          return t`Friday`;
        case 'Saturday':
          return t`Saturday`;
        case 'Sunday':
          return t`Sunday`;
        default:
          return value;
      }
    case ObjectRecordGroupByDateGranularity.MONTH_OF_THE_YEAR:
      switch (value) {
        case 'January':
          return t`January`;
        case 'February':
          return t`February`;
        case 'March':
          return t`March`;
        case 'April':
          return t`April`;
        case 'May':
          return t`May`;
        case 'June':
          return t`June`;
        case 'July':
          return t`July`;
        case 'August':
          return t`August`;
        case 'September':
          return t`September`;
        case 'October':
          return t`October`;
        case 'November':
          return t`November`;
        case 'December':
          return t`December`;
        default:
          return value;
      }
    default:
      return value;
  }
};
