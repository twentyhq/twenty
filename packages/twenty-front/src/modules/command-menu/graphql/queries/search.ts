import gql from 'graphql-tag';

export const SEARCH_QUERY = gql`
  query Search(
    $searchInput: String!
    $limit: Int!
    $excludedObjectNameSingulars: [String!]
    $includedObjectNameSingulars: [String!]
    $filter: ObjectRecordFilterInput
  ) {
    search(
      searchInput: $searchInput
      limit: $limit
      excludedObjectNameSingulars: $excludedObjectNameSingulars
      includedObjectNameSingulars: $includedObjectNameSingulars
      filter: $filter
    ) {
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
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
