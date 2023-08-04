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
  const setViewFieldsState = useSetRecoilState(viewFieldsState);
  const setEntityTableData = useSetEntityTableData();

  setEntityTableData(mockedCompaniesData, []);

  useEffect(() => {
    setViewFieldsState({
      objectName: 'company',
      viewFields: companyViewFields,
    });
    setEntityTableDimensions((prevState) => ({
      ...prevState,
      numberOfColumns: companyViewFields.length,
    }));
  }, [setEntityTableDimensions, setViewFieldsState]);

  return <></>;
}
