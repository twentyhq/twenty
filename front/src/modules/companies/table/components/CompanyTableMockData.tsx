import { companyViewFields } from '@/companies/constants/companyViewFields';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';

import { mockedCompaniesData } from './companies-mock-data';
export function CompanyTableMockData() {
  const setEntityTableData = useSetEntityTableData();

  setEntityTableData(mockedCompaniesData, companyViewFields, []);

  return <></>;
}
