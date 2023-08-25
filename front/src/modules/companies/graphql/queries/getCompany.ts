import { gql } from '@apollo/client';

export const GET_COMPANY = gql`
  query GetCompany($where: CompanyWhereUniqueInput!) {
    findUniqueCompany(where: $where) {
      id
      domainName
      name
      createdAt
      address
      linkedinUrl
      xUrl
      annualRecurringRevenue
      idealCustomerProfile
      employees
      _activityCount
      accountOwner {
        id
        email
        displayName
        avatarUrl
      }
      Favorite {
        id
        person {
          id
        }
        company {
          id
        }
      }
    }
  }
`;
