import gql from 'graphql-tag';
import { type PerformMetadataQueryParams } from 'test/integration/metadata/types/perform-metadata-query.type';

import { type DeleteViewSortInput } from 'src/engine/metadata-modules/view-sort/dtos/inputs/delete-view-sort.input';

export const deleteViewSortQueryFactory = ({
  input,
}: PerformMetadataQueryParams<DeleteViewSortInput>) => ({
  query: gql`
    mutation DeleteViewSort($input: DeleteViewSortInput!) {
      deleteViewSort(input: $input)
    }
  `,
  variables: {
    input,
  },
});
