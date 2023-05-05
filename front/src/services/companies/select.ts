import { QueryResult, gql, useQuery } from '@apollo/client';
import { Order_By, Companies_Order_By } from '../../generated/graphql';
import { GraphqlQueryCompany } from '../../interfaces/company.interface';
import { SelectedSortType } from '../../components/table/table-header/interface';

export type CompaniesSelectedSortType = SelectedSortType<Companies_Order_By>;

export const GET_COMPANIES = gql`
  query GetCompanies($orderBy: [companies_order_by!]) {
    companies(order_by: $orderBy) {
      id
      domain_name
      name
      created_at
      address
      employees
      account_owner {
        id
        email
        displayName
      }
    }
  }
`;

export function useCompaniesQuery(
  orderBy: Companies_Order_By[],
): QueryResult<{ companies: GraphqlQueryCompany[] }> {
  return useQuery<{ companies: GraphqlQueryCompany[] }>(GET_COMPANIES, {
    variables: { orderBy },
  });
}

export const defaultOrderBy: Companies_Order_By[] = [
  {
    name: Order_By.Asc,
  },
];
