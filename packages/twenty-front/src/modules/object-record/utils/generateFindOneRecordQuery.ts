import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import gql from 'graphql-tag';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

export const generateFindOneRecordQuery = ({
  objectMetadataItem,
  objectMetadataItems,
  recordGqlFields,
  withSoftDeleted = false,
  objectPermissionsByObjectMetadataId,
}: {
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'fields' | 'id' | 'readableFields'
  >;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  withSoftDeleted?: boolean;
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId;
}) => gql`
  query FindOne${capitalize(objectMetadataItem.nameSingular)}($objectRecordId: UUID!) {
    ${objectMetadataItem.nameSingular}(filter: {
      ${
        withSoftDeleted
          ? `or: [
              { deletedAt: { is: NULL } },
              { deletedAt: { is: NOT_NULL } }
            ],`
          : ''
      }
      id: { eq: $objectRecordId }
    })${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
    })}
  }
`;
