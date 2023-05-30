import { QueryResult, gql, useQuery } from '@apollo/client';
import {
  SortOrder as Order_By,
  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput as Companies_Bool_Exp,
} from '../../../generated/graphql';
import { GraphqlQueryCompany } from '../../../interfaces/entities/company.interface';
import { SelectedSortType } from '../../../interfaces/sorts/interface';

export type CompaniesSelectedSortType = SelectedSortType<Companies_Order_By>;

export const GET_COMPANIES = gql`
  query GetCompanies(
    $orderBy: [CompanyOrderByWithRelationInput!]
    $where: CompanyWhereInput
  ) {
    companies: findManyCompany(orderBy: $orderBy, where: $where) {
      id
      domainName
      name
      createdAt
      address
      employees
      accountOwner {
        id
        email
        displayName
      }
    }
  }
`;

export function useCompaniesQuery(
  orderBy: Companies_Order_By[],
  where: Companies_Bool_Exp,
): QueryResult<{ companies: GraphqlQueryCompany[] }> {
  return useQuery<{ companies: GraphqlQueryCompany[] }>(GET_COMPANIES, {
    variables: { orderBy, where },
  });
}

export const defaultOrderBy: Companies_Order_By[] = [
  {
    createdAt: Order_By.Desc,
  },
];
