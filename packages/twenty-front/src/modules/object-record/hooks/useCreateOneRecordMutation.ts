import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getCreateOneRecordMutationResponseField } from '@/object-record/utils/getCreateOneRecordMutationResponseField';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';

export const useCreateOneRecordMutation = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthRecordGqlFields({
      depth: 1,
      objectMetadataItem,
    });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { createOneRecordMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getCreateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  const createOneRecordMutation = gql`
    mutation CreateOne${capitalizedObjectName}($input: ${capitalizedObjectName}CreateInput!)  {
      ${mutationResponseField}(data: $input) ${mapObjectMetadataToGraphQLQuery({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields: appliedRecordGqlFields,
        objectPermissionsByObjectMetadataId,
      })}
    }
  `;

  return {
    createOneRecordMutation,
  };
};
