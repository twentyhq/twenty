import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { tableColumnsState } from '@/ui/table/states/tableColumnsState';

import { companyViewFields } from '../../constants/companyViewFields';

import { mockedCompaniesData } from './companies-mock-data';

export function CompanyTableMockData() {
  const setColumns = useSetRecoilState(tableColumnsState);
  const setEntityTableData = useSetEntityTableData();

  setEntityTableData(mockedCompaniesData, []);

  useEffect(() => {
    setColumns(companyViewFields);
  }, [setColumns]);

  return <></>;
}
