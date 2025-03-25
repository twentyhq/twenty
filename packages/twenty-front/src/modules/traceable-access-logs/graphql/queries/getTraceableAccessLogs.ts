import { gql } from '@apollo/client';

export const getLinklogs = gql`
  query GetLinklogs(
    $filter: LinkLogsFilterInput
    $orderBy: [LinkLogsOrderByInput]
    $lastCursor: String
    $limit: Int
  ) {
    linklogs(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          id
          product
          linkId
          utmSource
          utmMedium
          utmCampaign
          userIp
          userAgent
          createdAt
          updatedAt
          position
          linkName
          uv
        }
        cursor
        __typename
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
        __typename
      }
      totalCount
      __typename
    }
  }
`;
