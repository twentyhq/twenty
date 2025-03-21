import gql from 'graphql-tag';

export const globalSearch = gql`
  query GlobalSearch(
    $searchInput: String!
    $limit: Int!
    $excludedObjectNameSingulars: [String!]
    $includedObjectNameSingulars: [String!]
    $filter: ObjectRecordFilterInput
  ) {
    globalSearch(
      searchInput: $searchInput
      limit: $limit
      excludedObjectNameSingulars: $excludedObjectNameSingulars
      includedObjectNameSingulars: $includedObjectNameSingulars
      filter: $filter
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
