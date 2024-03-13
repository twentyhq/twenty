import { gql } from '@apollo/client';

export const FILTER_LEADS =  gql`
query FindManyLeads($filter: LeadFilterInput, $orderBy: LeadOrderByInput, $lastCursor: String, $limit: Float) {
    leads(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
      edges {
        node {
          id
          email
          age
          name
          phoneNumber
          advertisementName
          campaignName
          comments
          advertisementSource
          createdAt
          location
        }
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
        __typename
      }
      totalCount
      __typename
    }
  }`;