import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { generateGroupsRecordsGroupByQuery } from '@/object-record/record-aggregate/utils/generateGroupsRecordsGroupByQuery';
import { useRecordIndexGroupCommonQueryVariables } from '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useQuery } from '@apollo/client';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useRecordIndexGroupsRecordsGroupBy = ({
  objectMetadataItem,
  groupByFieldMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
  groupByFieldMetadataItem: Nullable<FieldMetadataItem>;
}) => {
  const { objectMetadataItems } = useObjectMetadataItems();
  const apolloCoreClient = useApolloCoreClient();

  const { combinedFilters, orderBy, recordGqlFields } =
    useRecordIndexGroupCommonQueryVariables();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const recordIndexGroupsRecordGroupsGroupByQuery =
    generateGroupsRecordsGroupByQuery({
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      recordGqlFields,
    });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const groupByGqlInput = isDefined(groupByFieldMetadataItem)
    ? buildGroupByFieldObject({
        field: groupByFieldMetadataItem,
      })
    : {};

  const { data, loading, error } = useQuery(
    recordIndexGroupsRecordGroupsGroupByQuery,
    {
      skip:
        !isDefined(objectMetadataItem) ||
        !hasReadPermission ||
        !isDefined(groupByFieldMetadataItem),
      variables: {
        filter: { ...combinedFilters },
        groupBy: {
          ...groupByGqlInput,
        },
        orderByForRecords: orderBy,
        limit: 20,
      },
      client: apolloCoreClient,
    },
  );

  return {
    data,
    loading,
    error,
  };
};
