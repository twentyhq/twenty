import { isNumber } from '@sniptt/guards';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordAggregateValueByRecordGroupValue } from '@/object-record/record-index/types/RecordAggregateValueByRecordGroupValue';
import { type RecordIndexGroupByQueryResult } from '@/object-record/record-index/types/RecordIndexGroupByQueryResult';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';

type TurnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValueParams =
  {
    queryResult: RecordIndexGroupByQueryResult;
    recordAggregateGqlField: string;
    objectMetadataItem: EnrichedObjectMetadataItem;
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

        const recordCount = groupByQueryResultItem.totalCount;

        recordAggregateValueByGroupValueArray.push({
          recordGroupValue: groupByValue,
          recordAggregateValue: aggregateValue,
          recordCount: isNumber(recordCount) ? recordCount : null,
        });
      }
    }

    return {
      recordAggregateValueByGroupValueArray,
    };
  };
