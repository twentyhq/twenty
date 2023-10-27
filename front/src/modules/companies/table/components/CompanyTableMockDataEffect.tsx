import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { useSetDataTableData } from '@/ui/data/data-table/hooks/useSetDataTableData';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { mockedCompaniesData } from './companies-mock-data';

export const CompanyTableMockDataEffect = () => {
  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setDataTableData = useSetDataTableData();

  useEffect(() => {
    setDataTableData(mockedCompaniesData, [], []);

    setTableColumns(companiesAvailableFieldDefinitions);
  }, [setDataTableData, setTableColumns]);

  return <></>;
};
