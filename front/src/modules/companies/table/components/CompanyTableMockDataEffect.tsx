import { useEffect } from 'react';

import { useSetDataTableData } from '@/ui/data-table/hooks/useSetDataTableData';
import { TableRecoilScopeContext } from '@/ui/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data-table/states/tableColumnsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

import { companiesAvailableColumnDefinitions } from '../../constants/companiesAvailableColumnDefinitions';

import { mockedCompaniesData } from './companies-mock-data';

export const CompanyTableMockDataEffect = () => {
  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );
  const setDataTableData = useSetDataTableData();

  useEffect(() => {
    setDataTableData(mockedCompaniesData, [], []);

    setTableColumns(companiesAvailableColumnDefinitions);
  }, [setDataTableData, setTableColumns]);

  return <></>;
};
