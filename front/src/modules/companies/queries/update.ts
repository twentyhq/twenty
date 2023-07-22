import { gql } from '@apollo/client';

export const UPDATE_ONE_COMPANY = gql`
  mutation UpdateOneCompany(
    $where: CompanyWhereUniqueInput!
    $data: CompanyUpdateInput!
  ) {
    updateOneCompany(data: $data, where: $where) {
      accountOwner {
        id
        email
        displayName
        firstName
        lastName
      }
      address
      createdAt
      domainName
      employees
      linkedinUrl
      id
      name
    }
  }
`;

export const INSERT_ONE_COMPANY = gql`
  mutation InsertOneCompany($data: CompanyCreateInput!) {
    createOneCompany(data: $data) {
      address
      createdAt
      domainName
      linkedinUrl
      employees
      id
      name
    }
  }
`;

export const DELETE_MANY_COMPANIES = gql`
  mutation DeleteManyCompanies($ids: [String!]) {
    deleteManyCompany(where: { id: { in: $ids } }) {
      count
    }
  }
`;
