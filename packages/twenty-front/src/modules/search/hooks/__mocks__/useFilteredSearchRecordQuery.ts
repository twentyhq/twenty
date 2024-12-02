import { gql } from '@apollo/client';

export const query = gql`
  query FindManyPeople(
    $filter: PersonFilterInput
    $orderBy: [PersonOrderByInput]
    $lastCursor: String
    $limit: Int = 60
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
                stage
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
            primaryLinkLabel
            primaryLinkUrl
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
                stage
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
              primaryLinkLabel
              primaryLinkUrl
            }
            linkedinLink {
              primaryLinkLabel
              primaryLinkUrl
            }
            domainName
            annualRecurringRevenue {
              amountMicros
              currencyCode
            }
            createdAt
            address {
              adressCity
            }
            updatedAt
            name
            accountOwnerId
            employees
            id
            idealCustomerProfile
          }
          city
          email
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
            primaryLinkLabel
            primaryLinkUrl
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

export const variables = {
  recordsToSelect: {
    limit: 10,
    filter: {
      and: [
        { and: [{ or: [{ name: { ilike: '%Entity%' } }] }] },
        { not: { id: { in: ['1', '2'] } } },
      ],
    },
    orderBy: [{ name: 'AscNullsLast' }],
  },
  filteredSelectedRecords: {
    limit: 60,
    filter: {
      and: [
        { and: [{ or: [{ name: { ilike: '%Entity%' } }] }] },
        { id: { in: ['1'] } },
      ],
    },
    orderBy: [{ name: 'AscNullsLast' }],
  },
  selectedEntities: {
    limit: 60,
    filter: { id: { in: ['1'] } },
    orderBy: [{ name: 'AscNullsLast' }],
  },
};

export const responseData = {
  edges: [],
};
