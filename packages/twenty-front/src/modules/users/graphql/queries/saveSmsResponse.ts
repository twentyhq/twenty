import { gql } from '@apollo/client';
export const SAVE_SMS_RESPONSE = gql`
  mutation CreateOneSms($input: SmsCreateInput!) {
    createSms(data: $input) {
      id
      dateCreated
      campaignName
      sid
      numSegments
      dateupdated
      createdAt
      uri
      status
      favorites {
        edges {
          node {
            __typename
            id
            campaignList {
              __typename
              id
            }
            specialty {
              __typename
              id
            }
            subspecialty {
              __typename
              id
            }
            subspecialtyId
            opportunityId
            company {
              __typename
              id
            }
            updatedAt
            createdAt
            messageResponseId
            workspaceMember {
              __typename
              id
            }
            person {
              __typename
              id
            }
            sms {
              __typename
              id
            }
            workspaceMemberId
            abcId
            personId
            abc {
              __typename
              id
            }
            id
            position
            opportunity {
              __typename
              id
            }
            companyId
            specialtyId
            campaignListId
            messageResponse {
              __typename
              id
            }
            smsId
          }
          __typename
        }
        __typename
      }
      position
      activityTargets {
        edges {
          node {
            __typename
            id
            abcId
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
            subspecialty {
              __typename
              id
            }
            activity {
              __typename
              id
            }
            specialty {
              __typename
              id
            }
            messageResponse {
              __typename
              id
            }
            company {
              __typename
              id
            }
            opportunityId
            specialtyId
            updatedAt
            subspecialtyId
            abc {
              __typename
              id
            }
            activityId
            opportunity {
              __typename
              id
            }
            smsId
            companyId
            messageResponseId
            sms {
              __typename
              id
            }
            campaignListId
          }
          __typename
        }
        __typename
      }
      id
      direction
      body
      to
      updatedAt
      from
      __typename
    }
  }
`;
