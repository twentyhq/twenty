import { useEffect } from 'react';

import { useSetCompanyEntityTable } from '../hooks/useSetCompanyEntityTable';

import { mockedCompaniesData } from './companies-mock-data';

export function CompanyEntityTableDataMocked() {
  const setCompanyEntityTable = useSetCompanyEntityTable();

  useEffect(() => {
    setCompanyEntityTable(mockedCompaniesData);
  }, [setCompanyEntityTable]);

  return <></>;
}
