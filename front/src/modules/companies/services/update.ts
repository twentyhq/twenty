import { gql } from '@apollo/client';

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany(
    $id: String
    $name: String
    $domainName: String
    $accountOwnerId: String
    $createdAt: DateTime
    $address: String
    $employees: Int
  ) {
    updateOneCompany(
      where: { id: $id }
      data: {
        accountOwner: { connect: { id: $accountOwnerId } }
        address: { set: $address }
        domainName: { set: $domainName }
        employees: { set: $employees }
        name: { set: $name }
        createdAt: { set: $createdAt }
      }
    ) {
      accountOwner {
        id
        email
        displayName
      }
      address
      createdAt
      domainName
      employees
      id
      name
    }
  }
`;

export const INSERT_COMPANY = gql`
  mutation InsertCompany(
    $id: String!
    $name: String!
    $domainName: String!
    $createdAt: DateTime
    $address: String!
    $employees: Int
  ) {
    createOneCompany(
      data: {
        id: $id
        name: $name
        domainName: $domainName
        createdAt: $createdAt
        address: $address
        employees: $employees
      }
    ) {
      address
      createdAt
      domainName
      employees
      id
      name
    }
  }
`;

export const DELETE_COMPANIES = gql`
  mutation DeleteCompanies($ids: [String!]) {
    deleteManyCompany(where: { id: { in: $ids } }) {
      count
    }
  }
`;
