import { FetchResult, gql } from '@apollo/client';

import { apiClient } from '~/apollo';

import { UpdateCompanyMutationVariables } from '../../../generated/graphql';
import { Company, mapToGqlCompany } from '../interfaces/company.interface';

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

export async function updateCompany(
  company: UpdateCompanyMutationVariables,
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: UPDATE_COMPANY,
    variables: company,
  });
  return result;
}

export async function insertCompany(
  company: Company,
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: INSERT_COMPANY,
    variables: mapToGqlCompany(company),
    refetchQueries: ['GetCompanies'],
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
