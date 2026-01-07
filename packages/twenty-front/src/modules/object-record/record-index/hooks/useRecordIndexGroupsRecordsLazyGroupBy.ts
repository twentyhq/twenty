import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlEdge } from '@/object-record/graphql/types/RecordGqlEdge';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useLazyQuery } from '@apollo/client';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type PageInfo } from '~/generated/graphql';

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

  const recordIndexGroupsRecordGroupsGroupByQuery =
    generateGroupsRecordsGroupByQuery({
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      recordGqlFields,
    });

  const groupByGqlInput = isDefined(groupByFieldMetadataItem)
    ? buildGroupByFieldObject({
        field: groupByFieldMetadataItem,
      })
    : {};

  const [executeRecordIndexGroupsRecordsLazyGroupBy] =
    useLazyQuery<GroupsRecordsGroupByLazyResult>(
      recordIndexGroupsRecordGroupsGroupByQuery,
      {
        variables: {
          filter: combinedFilters,
          groupBy: {
            ...groupByGqlInput,
          },
          orderByForRecords: orderBy,
          limit: recordGroupsLimit,
        },
        client: apolloCoreClient,
      },
    );

  return {
    executeRecordIndexGroupsRecordsLazyGroupBy,
  };
};
