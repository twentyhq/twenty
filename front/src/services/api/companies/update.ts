import { FetchResult, gql } from '@apollo/client';
import {
  Company,
  mapToGqlCompany,
} from '../../../interfaces/entities/company.interface';
import { apiClient } from '../../../apollo';

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany(
    $id: String
    $name: String
    $domain_name: String
    $account_owner_id: String
    $created_at: DateTime
    $address: String
    $employees: Int
  ) {
    updateOneCompany(
      where: { id: $id }
      data: {
        accountOwner: { connect: { id: $account_owner_id } }
        address: { set: $address }
        domainName: { set: $domain_name }
        employees: { set: $employees }
        name: { set: $name }
        createdAt: { set: $created_at }
      }
    ) {
      accountOwner {
        id
        email
        display_name: displayName
      }
      address
      created_at: createdAt
      domain_name: domainName
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
    $domain_name: String!
    $account_owner_id: String
    $created_at: DateTime
    $address: String!
    $employees: Int
  ) {
    createOneCompany(
      data: {
        id: $id
        name: $name
        domainName: $domain_name
        accountOwner: { connect: { id: $account_owner_id } }
        createdAt: $created_at
        address: $address
        employees: $employees
        workspace: { connect: { id: "il faut rajouter l'id du workspace" } }
      }
    ) {
      address
      created_at: createdAt
      domain_name: domainName
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

export async function updateCompany(
  company: Company,
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: UPDATE_COMPANY,
    variables: mapToGqlCompany(company),
  });
  return result;
}

export async function insertCompany(
  company: Company,
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: INSERT_COMPANY,
    variables: mapToGqlCompany(company),
  });

  return result;
}

export async function deleteCompanies(
  peopleIds: string[],
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: DELETE_COMPANIES,
    variables: { ids: peopleIds },
  });

  return result;
}
