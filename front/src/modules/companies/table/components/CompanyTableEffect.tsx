import { useEffect } from 'react';

import { companiesAvailableFieldDefinitions } from '@/companies/constants/companiesAvailableFieldDefinitions';
import { availableTableColumnsScopedState } from '@/ui/data/data-table/states/availableTableColumnsScopedState';
import { TableRecoilScopeContext } from '@/ui/data/data-table/states/recoil-scope-contexts/TableRecoilScopeContext';
import { tableColumnsScopedState } from '@/ui/data/data-table/states/tableColumnsScopedState';
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
  const { currentViewFields } = useViewInternalStates();

  const [, setTableColumns] = useRecoilScopedState(
    tableColumnsScopedState,
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

  return <></>;
};

export default CompanyTableEffect;
