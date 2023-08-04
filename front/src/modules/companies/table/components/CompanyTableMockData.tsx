import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { entityTableDimensionsState } from '@/ui/table/states/entityTableDimensionsState';
import { viewFieldsState } from '@/ui/table/states/viewFieldsState';

import { companyViewFields } from '../../constants/companyViewFields';

import { mockedCompaniesData } from './companies-mock-data';

export function CompanyTableMockData() {
  const setEntityTableDimensions = useSetRecoilState(
    entityTableDimensionsState,
  );
  const setViewFields = useSetRecoilState(viewFieldsState);
  const setEntityTableData = useSetEntityTableData();

  setEntityTableData(mockedCompaniesData, []);

  useEffect(() => {
    setViewFields(companyViewFields);
    setEntityTableDimensions((prevState) => ({
      ...prevState,
      numberOfColumns: companyViewFields.length,
    }));
  }, [setEntityTableDimensions, setViewFields]);

  return <></>;
}
