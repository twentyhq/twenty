import { gql } from '@apollo/client';

import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';
import { ActivityTargetableEntityForSelect } from '@/activities/types/ActivityTargetableEntityForSelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import {
  CompanyOrderByWithRelationInput as Companies_Order_By,
  CompanyWhereInput as Companies_Bool_Exp,
  SortOrder as Order_By,
  useGetCompaniesQuery,
  useSearchCompanyQuery,
} from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';

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
      linkedinUrl
      employees
      _activityCount
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
        entityType: ActivityTargetableEntityType.Company,
        name: company.name,
        avatarUrl: getLogoUrlFromDomainName(company.domainName),
        avatarType: 'squared',
      } as ActivityTargetableEntityForSelect),
    searchFilter,
    limit,
  });
}

export const defaultOrderBy: Companies_Order_By[] = [
  {
    createdAt: Order_By.Desc,
  },
];
