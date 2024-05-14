import { gql } from '@apollo/client';

export const query = gql`
  query FindManyPeople(
    $filter: PersonFilterInput
    $orderBy: PersonOrderByInput
    $lastCursor: String
    $limit: Int
  ) {
    people(
      filter: $filter
      orderBy: $orderBy
      first: $limit
      after: $lastCursor
    ) {
      edges {
        node {
          __typename
          id
          opportunities {
            edges {
              node {
                __typename
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                stage
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
                __typename
                id
                personId
                pointOfContactId
                updatedAt
                companyId
                stage
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
            __typename
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
                __typename
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
                __typename
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
                __typename
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
