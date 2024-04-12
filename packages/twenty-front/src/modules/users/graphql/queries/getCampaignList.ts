import { gql } from '@apollo/client';

export const GET_CAMPAIGN_LISTS = gql`
query FindManyCampaignLists($filter: CampaignListFilterInput, $orderBy: CampaignListOrderByInput, $lastCursor: String, $limit: Float) {
    campaignLists(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          id
          name
          subSpecialtyType
          formUrl
          description
          formNameId
          createdAt
          updatedAt
          campaignName
          messagingMedia
          specialtyType
          startDate
          endDate
          leads
          segment {
            id
            segmentName
            segmentDescription
            filters
          }
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
  }`