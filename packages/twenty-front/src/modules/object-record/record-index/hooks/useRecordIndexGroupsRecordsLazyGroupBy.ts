import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';

import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useLazyQuery } from '@apollo/client/react';
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
  objectMetadataItem: ObjectMetadataItem;
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

  const [executeRecordIndexGroupsRecordsLazyGroupByRaw] =
    useLazyQuery<GroupsRecordsGroupByLazyResult>(
      recordIndexGroupsRecordGroupsGroupByQuery,
      {
        client: apolloCoreClient,
        fetchPolicy: 'no-cache',
      },
    );

  const executeRecordIndexGroupsRecordsLazyGroupBy = useCallback(
    (
      options?: Parameters<
        typeof executeRecordIndexGroupsRecordsLazyGroupByRaw
      >[0],
    ) =>
      executeRecordIndexGroupsRecordsLazyGroupByRaw({
        ...options,
        variables: { ...defaultVariables, ...options?.variables },
      }),
    [executeRecordIndexGroupsRecordsLazyGroupByRaw, defaultVariables],
  );

  return {
    executeRecordIndexGroupsRecordsLazyGroupBy,
  };
};
