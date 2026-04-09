import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

export type FindManyFieldsMetadataFactoryInput = {
  filter: object;
  paging: object;
};

export const findManyFieldsMetadataQueryFactory = ({
  gqlFields = 'id',
  input,
}: PerformMetadataQueryParams<FindManyFieldsMetadataFactoryInput>) => ({
  query: gql`
      query FieldsMetadata($filter: FieldFilter!, $paging: CursorPaging!) {
        fields(paging: $paging, filter: $filter) {
          edges {
            node {
              ${gqlFields}
            }
          }
        }
      }
    `,
  variables: {
    filter: input.filter,
    paging: input.paging,
  },
});
