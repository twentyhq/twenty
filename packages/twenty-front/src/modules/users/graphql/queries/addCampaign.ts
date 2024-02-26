import { gql } from '@apollo/client';
export const ADD_CAMPAIGN = gql`
  mutation CreateOneCampaignList($input: CampaignListCreateInput!) {
    createCampaignList(data: $input) {
      id
      name
      updatedAt
      subSpecialtyType
      position
      endDate
      campaignName
      specialtyType
      activityTargets {
        edges {
          node {
            __typename
            id
            person {
              __typename
              id
            }
            id
            createdAt
            personId
            campaignList {
              __typename
              id
            }
            activity {
              __typename
              id
            }
            company {
              __typename
              id
            }
            opportunityId
            updatedAt
            activityId
            opportunity {
              __typename
              id
            }
            companyId
            campaignListId
          }
          __typename
        }
        __typename
      }
      startDate
      messagingMedia
      id
      createdAt
      description
      favorites {
        edges {
          node {
            __typename
            id
            campaignList {
              __typename
              id
            }
            opportunityId
            company {
              __typename
              id
            }
            updatedAt
            createdAt
            workspaceMember {
              __typename
              id
            }
            person {
              __typename
              id
            }
            workspaceMemberId
            personId
            id
            position
            opportunity {
              __typename
              id
            }
            companyId
            campaignListId
          }
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
