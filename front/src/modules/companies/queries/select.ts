import { gql } from '@apollo/client';

import { CommentableEntityForSelect } from '@/comments/types/CommentableEntityForSelect';
import { SelectedSortType } from '@/lib/filters-and-sorts/interfaces/sorts/interface';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { getLogoUrlFromDomainName } from '@/utils/utils';
import {
  CommentableType,
  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput as Companies_Bool_Exp,
  SortOrder as Order_By,
  useGetCompaniesQuery,
  useSearchCompanyQuery,
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
      _commentThreadCount
      accountOwner {
        id
        email
        displayName
        firstName
        lastName
        avatarUrl
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

export function useFilteredSearchCompanyQuery({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) {
  return useFilteredSearchEntityQuery({
    queryHook: useSearchCompanyQuery,
    searchOnFields: ['name'],
    orderByField: 'name',
    selectedIds: selectedIds,
    mappingFunction: (company) =>
      ({
        id: company.id,
        entityType: CommentableType.Company,
        name: company.name,
        avatarUrl: getLogoUrlFromDomainName(company.domainName),
        avatarType: 'squared',
      } as CommentableEntityForSelect),
    searchFilter,
    limit,
  });
}

export const defaultOrderBy: Companies_Order_By[] = [
  {
    createdAt: Order_By.Desc,
  },
];
