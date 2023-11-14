import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { companyTableFilterDefinitions } from '~/pages/companies/constants/companyTableFilterDefinitions';
import { companyTableSortDefinitions } from '~/pages/companies/constants/companyTableSortDefinitions';

const CompanyTableEffect = () => {
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
  } = useView();

  const { setAvailableTableColumns } = useRecordTable();

  useEffect(() => {
    setAvailableSortDefinitions?.(companyTableSortDefinitions);
    setAvailableFilterDefinitions?.(companyTableFilterDefinitions);
    setAvailableFieldDefinitions?.(companiesAvailableFieldDefinitions);
    setViewObjectMetadataId?.('company');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(companiesAvailableFieldDefinitions);
  }, [
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableTableColumns,
    setViewObjectMetadataId,
    setViewType,
  ]);

  return <></>;
};

export default CompanyTableEffect;
