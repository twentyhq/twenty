import { FetchResult, gql } from '@apollo/client';
import { Company, mapGqlCompany } from '../../interfaces/company.interface';
import { apiClient } from '../../apollo';

export const UPDATE_COMPANY = gql`
  mutation UpdateCompany(
    $id: uuid
    $name: String
    $domain_name: String
    $account_owner_id: uuid
    $address: String
    $employees: Int
  ) {
    update_companies(
      where: { id: { _eq: $id } }
      _set: {
        account_owner_id: $account_owner_id
        address: $address
        domain_name: $domain_name
        employees: $employees
        name: $name
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

export async function updateCompany(
  company: Company,
): Promise<FetchResult<Company>> {
  const result = await apiClient.mutate({
    mutation: UPDATE_COMPANY,
    variables: mapGqlCompany(company),
  });
  return result;
}
