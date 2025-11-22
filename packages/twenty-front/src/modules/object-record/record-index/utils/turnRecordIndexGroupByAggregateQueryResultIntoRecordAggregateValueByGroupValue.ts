import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordAggregateValueByRecordGroupValue } from '@/object-record/record-index/types/RecordAggregateValueByRecordGroupValue';
import { type RecordIndexGroupByQueryResult } from '@/object-record/record-index/types/RecordIndexGroupByQueryResult';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';

type TurnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValueParams =
  {
    queryResult: RecordIndexGroupByQueryResult;
    recordAggregateGqlField: string;
    objectMetadataItem: ObjectMetadataItem;
  };

export const turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue =
  ({
    objectMetadataItem,
    queryResult,
    recordAggregateGqlField,
  }: TurnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValueParams) => {
    const recordAggregateValueByGroupValueArray: RecordAggregateValueByRecordGroupValue[] =
      [];

    const queryResultGqlFieldName =
      getGroupByQueryResultGqlFieldName(objectMetadataItem);

    const groupByQueryResultItems = queryResult[queryResultGqlFieldName];

    for (const groupByQueryResultItem of groupByQueryResultItems) {
      if (groupByQueryResultItem.groupByDimensionValues.length === 1) {
        const groupByValue = groupByQueryResultItem.groupByDimensionValues[0];

        const gqlAggregateFieldName = recordAggregateGqlField;

        const aggregateValue = groupByQueryResultItem[gqlAggregateFieldName];

        recordAggregateValueByGroupValueArray.push({
          recordGroupValue: groupByValue,
          recordAggregateValue: aggregateValue,
        });
      }
    }

    return {
      recordAggregateValueByGroupValueArray,
    };
  };
