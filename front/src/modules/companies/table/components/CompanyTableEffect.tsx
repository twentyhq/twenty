import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
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
    setViewObjectId,
  } = useView();

  const [, setAvailableTableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableSortDefinitions?.(companyTableSortDefinitions);
    setAvailableFilterDefinitions?.(companyTableFilterDefinitions);
    setAvailableFieldDefinitions?.(companiesAvailableFieldDefinitions);
    setViewObjectId?.('company');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(companiesAvailableFieldDefinitions);
  }, [
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableTableColumns,
    setViewObjectId,
    setViewType,
  ]);

  return <></>;
};

export default CompanyTableEffect;
