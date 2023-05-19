import { FetchResult, gql } from '@apollo/client';
import {
  Company,
  mapToGqlCompany,
} from '../../../interfaces/entities/company.interface';
import { apiClient } from '../../../apollo';

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany(
    $id: uuid
    $name: String
    $domain_name: String
    $account_owner_id: uuid
    $created_at: timestamptz
    $address: String
    $employees: numeric
  ) {
    update_companies(
      where: { id: { _eq: $id } }
      _set: {
        account_owner_id: $account_owner_id
        address: $address
        domain_name: $domain_name
        employees: $employees
        name: $name
        created_at: $created_at
      }
    ) {
      affected_rows
      returning {
        account_owner {
          id
          email
          displayName
        }
        address
        created_at
        domain_name
        employees
        id
        name
      }
    }
  }
`;

export const INSERT_COMPANY = gql`
  mutation InsertCompany(
    $id: uuid
    $name: String
    $domain_name: String
    $account_owner_id: uuid
    $created_at: timestamptz
    $address: String
    $employees: numeric
  ) {
    insert_companies(
      objects: {
        id: $id
        name: $name
        domain_name: $domain_name
        account_owner_id: $account_owner_id
        created_at: $created_at
        address: $address
        employees: $employees
      }
    ) {
      affected_rows
      returning {
        address
        created_at
        domain_name
        employees
        id
        name
      }
    }
  }
`;

export const DELETE_COMPANIES = gql`
  mutation DeleteCompanies($ids: [uuid!]) {
    delete_companies(where: { id: { _in: $ids } }) {
      returning {
        address
        created_at
        domain_name
        employees
        id
        name
      }
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
