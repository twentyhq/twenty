import { gql } from '@apollo/client';

export const COMPANY_FIELDS_FRAGMENT = gql`
  fragment CompanyFieldsFragment on Company {
    accountOwner {
      id
      email
      displayName
      avatarUrl
    }
    address
    createdAt
    domainName
    employees
    linkedinUrl
    id
    name
  }
`;

export const UPDATE_ONE_COMPANY = gql`
  mutation UpdateOneCompany(
    $where: CompanyWhereUniqueInput!
    $data: CompanyUpdateInput!
  ) {
    updateOneCompany(data: $data, where: $where) {
      ...CompanyFieldsFragment
    }
  }
`;

export const INSERT_ONE_COMPANY = gql`
  mutation InsertOneCompany($data: CompanyCreateInput!) {
    createOneCompany(data: $data) {
      ...CompanyFieldsFragment
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
