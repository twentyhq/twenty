import gql from 'graphql-tag';

export const search = gql`
  query Search(
    $searchInput: String!
    $limit: Int
    $limitPerObject: Int
    $offset: Int
    $excludedObjectNameSingulars: [String!]
    $includedObjectNameSingulars: [String!]
    $filter: ObjectRecordFilterInput
  ) {
    search(
      searchInput: $searchInput
      limit: $limit
      limitPerObject: $limitPerObject
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
