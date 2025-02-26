import gql from 'graphql-tag';

export const globalSearch = gql`
  query GlobalSearch(
    $searchInput: String!
    $limit: Int!
    $excludedObjectNameSingulars: [String!]!
  ) {
    globalSearch(
      searchInput: $searchInput
      limit: $limit
      excludedObjectNameSingulars: $excludedObjectNameSingulars
    ) {
      recordId
      objectSingularName
      label
      imageUrl
      tsRankCD
      tsRank
    }
  }
`;
