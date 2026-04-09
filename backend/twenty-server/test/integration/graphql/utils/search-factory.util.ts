import gql from 'graphql-tag';

import { type SearchArgs } from 'src/engine/core-modules/search/dtos/search-args';

export const searchFactory = ({
  searchInput,
  excludedObjectNameSingulars,
  includedObjectNameSingulars,
  filter,
  after,
  limit = 50,
}: SearchArgs) => ({
  query: gql`
    query Search(
      $searchInput: String!
      $limit: Int!
      $after: String
      $excludedObjectNameSingulars: [String!]
      $includedObjectNameSingulars: [String!]
      $filter: ObjectRecordFilterInput
    ) {
      search(
        searchInput: $searchInput
        limit: $limit
        after: $after
        excludedObjectNameSingulars: $excludedObjectNameSingulars
        includedObjectNameSingulars: $includedObjectNameSingulars
        filter: $filter
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            recordId
            objectNameSingular
            label
            imageUrl
            tsRankCD
            tsRank
          }
          cursor
        }
      }
    }
  `,
  variables: {
    searchInput,
    limit,
    after,
    excludedObjectNameSingulars,
    includedObjectNameSingulars,
    filter,
  },
});
