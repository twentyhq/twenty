import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { isFetchingEntityTableDataState } from '@/ui/table/states/isFetchingEntityTableDataState';
import { tableRowIdsState } from '@/ui/table/states/tableRowIdsState';

import { useSetCompanyEntityTable } from '../hooks/useSetCompanyEntityTable';

import { mockedCompaniesData } from './companies-mock-data';

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
