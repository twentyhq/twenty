import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';

import { mockedCompaniesData } from './companies-mock-data';

export const CompanyTableMockDataEffect = () => {
  const { setRecordTableData, setTableColumns } = useRecordTable();

  useEffect(() => {
    setRecordTableData(mockedCompaniesData);
    setTableColumns(companiesAvailableFieldDefinitions);
  }, [setRecordTableData, setTableColumns]);

  return <></>;
};
