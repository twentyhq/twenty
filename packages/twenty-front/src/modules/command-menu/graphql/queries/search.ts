import gql from 'graphql-tag';

export const search = gql`
  query Search(
    $searchInput: String!
    $limit: Int!
    $offset: Int
    $excludedObjectNameSingulars: [String!]
    $includedObjectNameSingulars: [String!]
    $filter: ObjectRecordFilterInput
  ) {
    search(
      searchInput: $searchInput
      limit: $limit
      offset: $offset
      excludedObjectNameSingulars: $excludedObjectNameSingulars
      includedObjectNameSingulars: $includedObjectNameSingulars
      filter: $filter
    ) {
      recordId
      objectNameSingular
      label
      imageUrl
      tsRankCD
      tsRank
    }
  }
`;
