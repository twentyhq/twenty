import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type CreateObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/create-object.input';

export type CreateOneObjectFactoryInput = Omit<
  CreateObjectInput,
  'workspaceId' | 'dataSourceId'
>;

export const createOneObjectMetadataQueryFactory = ({
  input,
  gqlFields = 'id',
}: PerformMetadataQueryParams<CreateOneObjectFactoryInput>) => ({
  query: gql`
        mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
          createOneObject(input: $input) {
            ${gqlFields}
        }
      }
      `,
  variables: {
    input: { object: input },
  },
});
