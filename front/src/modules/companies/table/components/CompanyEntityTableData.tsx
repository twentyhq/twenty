import { useRecoilState } from 'recoil';

import { defaultOrderBy } from '@/companies/queries';
import { isFetchingEntityTableDataState } from '@/ui/table/states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';
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
