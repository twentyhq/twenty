import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
import { tableFiltersScopedState } from '@/ui/data/data-table/states/tableFiltersScopedState';
import { tableSortsScopedState } from '@/ui/data/data-table/states/tableSortsScopedState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';
import { ViewType } from '~/generated/graphql';
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
  const { currentViewFields, currentViewSorts, currentViewFilters } =
    useViewInternalStates();

  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
    TableRecoilScopeContext,
  );

  const [, setTableSorts] = useRecoilScopedState(
    tableSortsScopedState,
    TableRecoilScopeContext,
  );

  const [, setTableFilters] = useRecoilScopedState(
    tableFiltersScopedState,
    TableRecoilScopeContext,
  );

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
    setTableColumns,
    setViewObjectId,
    setViewType,
  ]);
  useEffect(() => {
    if (currentViewFields) {
      setTableColumns([...currentViewFields].sort((a, b) => a.index - b.index));
    }
  }, [currentViewFields, setTableColumns]);

  useEffect(() => {
    if (currentViewSorts) {
      setTableSorts(currentViewSorts);
    }
  }, [currentViewFields, currentViewSorts, setTableColumns, setTableSorts]);

  useEffect(() => {
    if (currentViewFilters) {
      setTableFilters(currentViewFilters);
    }
  }, [
    currentViewFields,
    currentViewFilters,
    setTableColumns,
    setTableFilters,
    setTableSorts,
  ]);

  return <></>;
};

export default CompanyTableEffect;
