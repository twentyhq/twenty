import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getCreateManyRecordsMutationResponseField } from '@/object-record/utils/getCreateManyRecordsMutationResponseField';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useCreateManyRecordsMutation = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { createManyRecordsMutation: EMPTY_MUTATION };
  }

  const mutationResponseField = getCreateManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const createManyRecordsMutation = gql`
    mutation Create${capitalize(
      objectMetadataItem.namePlural,
    )}($data: [${capitalize(
      objectMetadataItem.nameSingular,
    )}CreateInput!]!, $upsert: Boolean)  {
      ${mutationResponseField}(data: $data, upsert: $upsert) ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        },
      )}
  }`;

  return {
    createManyRecordsMutation,
  };
};
