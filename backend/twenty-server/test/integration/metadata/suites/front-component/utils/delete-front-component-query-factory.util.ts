import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type DeleteFrontComponentFactoryInput = {
  id: string;
};

const DEFAULT_FRONT_COMPONENT_GQL_FIELDS = `
  id
  name
`;

export const deleteFrontComponentQueryFactory = ({
  input,
  gqlFields = DEFAULT_FRONT_COMPONENT_GQL_FIELDS,
}: PerformMetadataQueryParams<DeleteFrontComponentFactoryInput>) => ({
  query: gql`
    mutation DeleteFrontComponent($id: UUID!) {
      deleteFrontComponent(id: $id) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    id: input.id,
  },
});
