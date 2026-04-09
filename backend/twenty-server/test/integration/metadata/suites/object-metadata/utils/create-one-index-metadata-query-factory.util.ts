import gql from 'graphql-tag';
import { type UpdateOneFieldFactoryInput } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata-query-factory.util';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

type CreateIndexMetadataInput = {
  objectMetadataId: string;
  isUnique: boolean;
  indexFieldMetadatas: {
    fieldMetadataId: string;
  }[];
};

export type CreateOneIndexMetadataFactoryInput = {
  input: CreateIndexMetadataInput;
};

export const createOneIndexMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<UpdateOneFieldFactoryInput>) => ({
  query: gql`
        mutation UpdateOneFieldMetadataItem($idToUpdate: UUID!, $updatePayload: UpdateFieldInput!) {
            updateOneField(input: {id: $idToUpdate, update: $updatePayload}) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    idToUpdate: input.idToUpdate,
    updatePayload: input.updatePayload,
  },
});
