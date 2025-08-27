import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { getUpdateOneRecordMutationResponseField } from '@/object-record/utils/getUpdateOneRecordMutationResponseField';
import { gql } from '@apollo/client';
import { type ObjectPermissions } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateUpdateOneRecordMutation = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  computeReferences,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: ObjectMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
}) => {
  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthOneRecordGqlFields({
      objectMetadataItem,
    });

  const capitalizedObjectName = capitalize(objectMetadataItem.nameSingular);

  const mutationResponseField = getUpdateOneRecordMutationResponseField(
    objectMetadataItem.nameSingular,
  );

  const updateOneRecordMutation = gql`
  mutation UpdateOne${capitalizedObjectName}($idToUpdate: UUID!, $input: ${capitalizedObjectName}UpdateInput!){
    ${mutationResponseField}(id: $idToUpdate, data: $input) ${mapObjectMetadataToGraphQLQuery(
      {
        objectMetadataItems,
        objectMetadataItem,
        computeReferences,
        recordGqlFields: appliedRecordGqlFields,
        objectPermissionsByObjectMetadataId,
      },
    )}
  }
`;

  return updateOneRecordMutation;
};
