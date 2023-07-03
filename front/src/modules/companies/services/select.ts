import { gql } from '@apollo/client';

import { SelectedSortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import {
  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput as Companies_Bool_Exp,
  SortOrder as Order_By,
  useGetCompaniesQuery,
} from '~/generated/graphql';

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
      _commentCount
      accountOwner {
        id
        email
        displayName
        firstName
        lastName
      }
    }
  }
`;

export function useCompaniesQuery(
  orderBy: Companies_Order_By[],
  where: Companies_Bool_Exp,
) {
  return useGetCompaniesQuery({ variables: { orderBy, where } });
}

export const defaultOrderBy: Companies_Order_By[] = [
  {
    createdAt: Order_By.Desc,
  },
];
