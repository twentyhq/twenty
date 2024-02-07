import { gql } from '@apollo/client';

export const query = gql`
  query FindManyPeople(
    $filter: PersonFilterInput
    $orderBy: PersonOrderByInput
    $lastCursor: String
    $limit: Float
  ) {
    people(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          id
          opportunities {
            edges {
              node {
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                pipelineStepId
                probability
                closeDate
                amount {
                  amountMicros
                  currencyCode
                }
                id
                createdAt
              }
            }
          }
          xLink {
            label
            url
          }
          id
          pointOfContactForOpportunities {
            edges {
              node {
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                pipelineStepId
                probability
                closeDate
                amount {
                  amountMicros
                  currencyCode
                }
                id
                createdAt
              }
            }
          }
          createdAt
          company {
            id
            xLink {
              label
              url
            }
            linkedinLink {
              label
              url
            }
            domainName
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            createdAt
            address
            updatedAt
            name
            accountOwnerId
            employees
            id
            idealCustomerProfile
          }
          city
          email
          activityTargets {
            edges {
              node {
                id
                updatedAt
                createdAt
                personId
                activityId
                companyId
                id
              }
            }
          }
          jobTitle
          favorites {
            edges {
              node {
                id
                id
                companyId
                createdAt
                personId
                position
                workspaceMemberId
                updatedAt
              }
            }
          }
          attachments {
            edges {
              node {
                id
                updatedAt
                createdAt
                name
                personId
                activityId
                companyId
                id
                authorId
                type
                fullPath
              }
            }
          }
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            label
            url
          }
          updatedAt
          avatarUrl
          companyId
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

export const variables = { limit: 60, filter: undefined, orderBy: undefined };

export const responseData = {
  id: '',
};
