import { defaultOrderBy } from '@/companies/queries';
import {
  PersonOrderByWithRelationInput,
  useGetCompaniesQuery,
} from '~/generated/graphql';

import { useSetCompanyEntityTable } from '../hooks/useSetCompanyEntityTable';

export function CompanyEntityTableData({
  orderBy = defaultOrderBy,
  whereFilters,
}: {
  orderBy?: PersonOrderByWithRelationInput[];
  whereFilters?: any;
}) {
  console.log('CompanyEntityTableData');
  const setCompanyEntityTable = useSetCompanyEntityTable();

  useGetCompaniesQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const companies = data.companies ?? [];

      setCompanyEntityTable(companies);
    },
  });

  return <></>;
}
