import { useRecoilState } from 'recoil';

import { defaultOrderBy } from '@/companies/queries';
import { isFetchingEntityTableDataState } from '@/ui/tables/states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '@/ui/tables/states/tableRowIdsState';
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
  const [, setTableRowIds] = useRecoilState(tableRowIdsState);

  const [, setIsFetchingEntityTableData] = useRecoilState(
    isFetchingEntityTableDataState,
  );

  const setCompanyEntityTable = useSetCompanyEntityTable();

  useGetCompaniesQuery({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data) => {
      const companies = data.companies ?? [];

      const companyIds = companies.map((company) => company.id);

      setTableRowIds((currentRowIds) => {
        if (JSON.stringify(currentRowIds) !== JSON.stringify(companyIds)) {
          return companyIds;
        }

        return currentRowIds;
      });

      setCompanyEntityTable(companies);

      setIsFetchingEntityTableData(false);
    },
  });

  return <></>;
}
