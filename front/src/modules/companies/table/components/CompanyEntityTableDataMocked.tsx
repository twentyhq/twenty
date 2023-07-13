import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { isFetchingEntityTableDataState } from '@/ui/tables/states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '@/ui/tables/states/tableRowIdsState';
import { mockedCompaniesData } from '~/testing/mock-data/companies';

import { useSetCompanyEntityTable } from '../hooks/useSetCompanyEntityTable';

export function CompanyEntityTableDataMocked() {
  const [, setTableRowIds] = useRecoilState(tableRowIdsState);

  const [, setIsFetchingEntityTableData] = useRecoilState(
    isFetchingEntityTableDataState,
  );

  const setCompanyEntityTable = useSetCompanyEntityTable();

  useEffect(() => {
    const companyIds = mockedCompaniesData.map((company) => company.id);

    setTableRowIds((currentRowIds) => {
      if (JSON.stringify(currentRowIds) !== JSON.stringify(companyIds)) {
        return companyIds;
      }

      return currentRowIds;
    });

    setCompanyEntityTable(mockedCompaniesData);

    setIsFetchingEntityTableData(false);
  }, [setCompanyEntityTable, setIsFetchingEntityTableData, setTableRowIds]);

  return <></>;
}
