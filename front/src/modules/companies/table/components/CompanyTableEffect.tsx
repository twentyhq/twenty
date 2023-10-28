import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { companyAvailableFilters } from '~/pages/companies/companies-filters';
import { companyAvailableSorts } from '~/pages/companies/companies-sorts';

const CompanyTableEffect = () => {
  const {
    setAvailableSorts,
    setAvailableFilters,
    setAvailableFields,
    setViewType,
    setViewObjectId,
  } = useView();

  const [, setAvailableTableColumns] = useRecoilScopedState(
    availableTableColumnsScopedState,
    TableRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableSorts?.(companyAvailableSorts);
    setAvailableFilters?.(companyAvailableFilters);
    setAvailableFields?.(companiesAvailableFieldDefinitions);
    setViewObjectId?.('company');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(companiesAvailableFieldDefinitions);
  }, [
    setAvailableFields,
    setAvailableFilters,
    setAvailableSorts,
    setAvailableTableColumns,
    setViewObjectId,
    setViewType,
  ]);
  // useEffect(() => {
  //   if (currentViewFields) {
  //     setTableColumns([...currentViewFields].sort((a, b) => a.index - b.index));
  //   }
  // }, [currentViewFields, setTableColumns]);

  // useEffect(() => {
  //   if (currentViewSorts) {
  //     setTableSorts(currentViewSorts);
  //   }
  // }, [currentViewFields, currentViewSorts, setTableColumns, setTableSorts]);

  // useEffect(() => {
  //   if (currentViewFilters) {
  //     setTableFilters(currentViewFilters);
  //   }
  // }, [
  //   currentViewFields,
  //   currentViewFilters,
  //   setTableColumns,
  //   setTableFilters,
  //   setTableSorts,
  // ]);

  return <></>;
};

export default CompanyTableEffect;
