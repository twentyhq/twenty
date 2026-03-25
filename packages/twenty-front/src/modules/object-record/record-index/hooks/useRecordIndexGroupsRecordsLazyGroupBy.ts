import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';

import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useCallback, useMemo } from 'react';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PageInfo } from '~/generated-metadata/graphql';

export type GroupsRecordsGroupByLazyResult = {
  [queryGqlFieldName: string]: Array<{
    groupByDimensionValues: string[];
    edges: RecordGqlEdge[];
    pageInfo: PageInfo;
    __typename: string;
  }>;
};

export const useRecordIndexGroupsRecordsLazyGroupBy = ({
  objectMetadataItem,
  groupByFieldMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  groupByFieldMetadataItem: Nullable<FieldMetadataItem>;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();

  const { combinedFilters, orderBy, recordGqlFields, recordGroupsLimit } =
    useRecordIndexGroupCommonQueryVariables();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const recordIndexGroupsRecordGroupsGroupByQuery = useMemo(
    () =>
      generateGroupsRecordsGroupByQuery({
        objectMetadataItem,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        recordGqlFields,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      recordGqlFields,
    ],
  );

  const groupByGqlInput = useMemo(
    () =>
      isDefined(groupByFieldMetadataItem)
        ? buildGroupByFieldObject({
            field: groupByFieldMetadataItem,
          })
        : {},
    [groupByFieldMetadataItem],
  );

  const defaultVariables = useMemo(
    () => ({
      filter: combinedFilters,
      groupBy: {
        ...groupByGqlInput,
      },
      orderByForRecords: orderBy,
      limit: recordGroupsLimit,
    }),
    [combinedFilters, groupByGqlInput, orderBy, recordGroupsLimit],
  );

  const executeRecordIndexGroupsRecordsLazyGroupBy = useCallback(
    (options?: { variables?: Record<string, unknown> }) =>
      apolloCoreClient.query<GroupsRecordsGroupByLazyResult>({
        query: recordIndexGroupsRecordGroupsGroupByQuery,
        variables: { ...defaultVariables, ...options?.variables },
        fetchPolicy: 'no-cache',
      }),
    [
      apolloCoreClient,
      recordIndexGroupsRecordGroupsGroupByQuery,
      defaultVariables,
    ],
  );

  return {
    executeRecordIndexGroupsRecordsLazyGroupBy,
  };
};
