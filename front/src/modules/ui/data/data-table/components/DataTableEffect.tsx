import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useView } from '@/views/hooks/useView';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { SortDefinition } from '../../sort/types/SortDefinition';
import { useSetDataTableData } from '../hooks/useSetDataTableData';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tablefiltersWhereScopedSelector } from '../states/selectors/tablefiltersWhereScopedSelector';
import { tableSortsOrderByScopedSelector } from '../states/selectors/tableSortsOrderByScopedSelector';

export const DataTableEffect = ({
  useGetRequest,
  getRequestResultKey,
  getRequestOptimisticEffectDefinition,

  filterDefinitionArray,
  setActionBarEntries,
  setContextMenuEntries,
  sortDefinitionArray,
}: {
  useGetRequest: typeof useGetCompaniesQuery | typeof useGetPeopleQuery;
  getRequestResultKey: string;
  getRequestOptimisticEffectDefinition: OptimisticEffectDefinition<any>;

  filterDefinitionArray: FilterDefinition[];
  sortDefinitionArray: SortDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) => {
  const setDataTableData = useSetDataTableData();
  const { registerOptimisticEffect } = useOptimisticEffect();
  const { setCurrentViewId } = useView();

  const tableSortsOrderBy = useRecoilScopedValue(
    tableSortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  const sortsOrderBy = defaults(tableSortsOrderBy, [
    {
      createdAt: SortOrder.Desc,
    },
  ]);
  const tablefiltersWhere = useRecoilScopedValue(
    tablefiltersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  useGetRequest({
    variables: { orderBy: sortsOrderBy, where: tablefiltersWhere },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];

      setDataTableData(entities, filterDefinitionArray, sortDefinitionArray);

      registerOptimisticEffect({
        variables: { orderBy: sortsOrderBy, where: tablefiltersWhere },
        definition: getRequestOptimisticEffectDefinition,
      });
    },
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      //setCurrentViewId(viewId);
    }
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [
    searchParams,
    setActionBarEntries,
    setContextMenuEntries,
    setCurrentViewId,
  ]);

  return <></>;
};
