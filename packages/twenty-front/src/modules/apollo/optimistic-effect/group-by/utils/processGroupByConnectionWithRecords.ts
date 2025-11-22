import { doesRecordBelongToGroup } from '@/apollo/optimistic-effect/group-by/utils/doesRecordBelongToGroup';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { createCacheEdgeWithRecordRef } from '@/object-record/cache/utils/createCacheEdgeWithRecordRef';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { isRecordMatchingFilter } from '@/object-record/record-filter/utils/isRecordMatchingFilter';
import {
  type ReadFieldFunction,
  type ToReferenceFunction,
} from '@apollo/client/cache/core/types/common';
import { isDefined } from 'twenty-shared/utils';

type ProcessGroupByConnectionWithRecordsArgs = {
  cachedEdges: readonly RecordGqlRefEdge[];
  cachedPageInfo: {
    startCursor?: string;
    endCursor?: string;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  records: RecordGqlNode[];
  operation: 'create' | 'update' | 'delete';
  queryFilter: any;
  shouldMatchRootQueryFilter: boolean;
  groupByDimensionValues: readonly string[];
  groupByConfig?:
    | Array<Record<string, boolean | Record<string, string>>>
    | Record<string, boolean | Record<string, string>>;
  objectMetadataItem: ObjectMetadataItem;
  readField: ReadFieldFunction;
  toReference: ToReferenceFunction;
};

export const processGroupByConnectionWithRecords = ({
  cachedEdges,
  cachedPageInfo,
  records,
  operation,
  queryFilter,
  shouldMatchRootQueryFilter,
  groupByDimensionValues,
  groupByConfig,
  objectMetadataItem,
  readField,
  toReference,
}: ProcessGroupByConnectionWithRecordsArgs): {
  nextEdges: RecordGqlRefEdge[];
  nextPageInfo: {
    startCursor?: string;
    endCursor?: string;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
  totalCountDelta: number;
} => {
  const nextEdges = [...cachedEdges];
  const nextPageInfo = isDefined(cachedPageInfo) ? { ...cachedPageInfo } : {};
  let totalCountDelta = 0;

  for (const record of records) {
    const recordMatchesFilter = isRecordMatchingFilter({
      record,
      filter: queryFilter ?? {},
      objectMetadataItem,
    });

    const belongsToGroup = doesRecordBelongToGroup(
      record,
      groupByDimensionValues,
      groupByConfig,
    );

    const recordReference = toReference(record);

    if (!recordReference) {
      continue;
    }

    const recordIndexInEdges = cachedEdges.findIndex(
      (cachedEdge) => readField('id', cachedEdge.node) === record.id,
    );
    const recordExistsInEdges = recordIndexInEdges !== -1;

    if (operation === 'create') {
      const shouldAdd =
        (!shouldMatchRootQueryFilter || recordMatchesFilter) &&
        belongsToGroup &&
        !recordExistsInEdges;

      if (shouldAdd) {
        const edge = createCacheEdgeWithRecordRef({
          record,
          objectMetadataItem,
          toReference,
        });

        if (isDefined(edge)) {
          nextEdges.unshift(edge);
          nextPageInfo.startCursor = edge.cursor;
          totalCountDelta++;
        }
      }
    }

    if (operation === 'update') {
      const shouldBeInGroup = recordMatchesFilter && belongsToGroup;

      if (shouldBeInGroup && !recordExistsInEdges) {
        const edge = createCacheEdgeWithRecordRef({
          record,
          objectMetadataItem,
          toReference,
        });

        if (isDefined(edge)) {
          nextEdges.push(edge);
          totalCountDelta++;
        }
      } else if (!shouldBeInGroup && recordExistsInEdges) {
        nextEdges.splice(recordIndexInEdges, 1);
        totalCountDelta--;
      }
    }

    if (operation === 'delete' && recordExistsInEdges) {
      nextEdges.splice(recordIndexInEdges, 1);
      totalCountDelta--;
    }
  }

  return { nextEdges, nextPageInfo, totalCountDelta };
};
