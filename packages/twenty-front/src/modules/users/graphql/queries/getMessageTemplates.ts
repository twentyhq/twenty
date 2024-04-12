import { gql } from '@apollo/client';

export const GET_MESSAGE_TEMPLATES = gql`
query FindManyMessageTemplates($filter: MessageTemplateFilterInput, $orderBy: MessageTemplateOrderByInput, $lastCursor: String, $limit: Float) {
    messageTemplates(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          id
          id
          position
          typeOfCommunicationChannels
          updatedAt
          attachments {
            edges {
              node {
                __typename
                id
                messageTemplate {
                  __typename
                  id
                }
                fullPath
                activity {
                  __typename
                  id
                }
                updatedAt
                leadId
                subspecialty {
                  __typename
                  id
                }
                segmentList {
                  __typename
                  id
                }
                lead {
                  __typename
                  id
                }
                companyId
                subspecialtyId
                type
                campaignList {
                  __typename
                  id
                }
                messageTemplateId
                specialty {
                  __typename
                  id
                }
                segmentListId
                createdAt
                person {
                  __typename
                  id
                }
                id
                campaignTrigger {
                  __typename
                  id
                }
                company {
                  __typename
                  id
                }
                opportunity {
                  __typename
                  id
                }
                messageResponseId
                specialtyId
                appointmentFormId
                name
                campaignTriggerId
                authorId
                campaignFormId
                campaignForm {
                  __typename
                  id
                }
                messageResponse {
                  __typename
                  id
                }
                campaignListId
                author {
                  __typename
                  id
                }
                appointmentForm {
                  __typename
                  id
                }
                opportunityId
                activityId
                personId
              }
              __typename
            }
            __typename
          }
          favorites {
            edges {
              node {
                __typename
                id
                updatedAt
                position
                workspaceMemberId
                campaignListId
                messageTemplate {
                  __typename
                  id
                }
                campaignFormId
                subspecialty {
                  __typename
                  id
                }
                campaignTriggerId
                personId
                campaignForm {
                  __typename
                  id
                }
                company {
                  __typename
                  id
                }
                appointmentForm {
                  __typename
                  id
                }
                person {
                  __typename
                  id
                }
                appointmentFormId
                id
                segmentList {
                  __typename
                  id
                }
                campaignTrigger {
                  __typename
                  id
                }
                messageResponse {
                  __typename
                  id
                }
                messageResponseId
                messageTemplateId
                segmentListId
                opportunityId
                specialty {
                  __typename
                  id
                }
                subspecialtyId
                createdAt
                leadId
                specialtyId
                opportunity {
                  __typename
                  id
                }
                workspaceMember {
                  __typename
                  id
                }
                companyId
                campaignList {
                  __typename
                  id
                }
                lead {
                  __typename
                  id
                }
              }
              __typename
            }
            __typename
          }
          status
          body
          typeOfCommunicationChannel
          name
          activityTargets {
            edges {
              node {
                __typename
                id
                company {
                  __typename
                  id
                }
                specialtyId
                campaignFormId
                messageTemplate {
                  __typename
                  id
                }
                campaignList {
                  __typename
                  id
                }
                opportunity {
                  __typename
                  id
                }
                subspecialty {
                  __typename
                  id
                }
                activityId
                id
                appointmentForm {
                  __typename
                  id
                }
                person {
                  __typename
                  id
                }
                leadId
                messageResponse {
                  __typename
                  id
                }
                segmentListId
                createdAt
                segmentList {
                  __typename
                  id
                }
                appointmentFormId
                opportunityId
                campaignTriggerId
                campaignTrigger {
                  __typename
                  id
                }
                activity {
                  __typename
                  id
                }
                updatedAt
                messageResponseId
                campaignForm {
                  __typename
                  id
                }
                messageTemplateId
                companyId
                subspecialtyId
                lead {
                  __typename
                  id
                }
                personId
                specialty {
                  __typename
                  id
                }
                campaignListId
              }
              __typename
            }
            __typename
          }
          createdAt
          __typename
        }
        cursor
        __typename
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
  }
`;