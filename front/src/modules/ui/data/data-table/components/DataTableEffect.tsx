import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';
import { useRecoilCallback } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { currentViewIdScopedState } from '@/ui/data/view-bar/states/currentViewIdScopedState';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/data/view-bar/states/savedFiltersFamilyState';
import { savedSortsFamilyState } from '@/ui/data/view-bar/states/savedSortsFamilyState';
import { sortsScopedState } from '@/ui/data/view-bar/states/sortsScopedState';
import { FilterDefinition } from '@/ui/data/view-bar/types/FilterDefinition';
import { SortDefinition } from '@/ui/data/view-bar/types/SortDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { filtersWhereScopedSelector } from '../../view-bar/states/selectors/filtersWhereScopedSelector';
import { sortsOrderByScopedSelector } from '../../view-bar/states/selectors/sortsOrderByScopedSelector';
import { useSetDataTableData } from '../hooks/useSetDataTableData';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';

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

  let sortsOrderBy = useRecoilScopedValue(
    sortsOrderByScopedSelector,
    TableRecoilScopeContext,
  );
  sortsOrderBy = defaults(sortsOrderBy, [
    {
      createdAt: SortOrder.Desc,
    },
  ]);
  const filtersWhere = useRecoilScopedValue(
    filtersWhereScopedSelector,
    TableRecoilScopeContext,
  );

  useGetRequest({
    variables: { orderBy: sortsOrderBy, where: filtersWhere },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];

      setDataTableData(entities, filterDefinitionArray, sortDefinitionArray);

      registerOptimisticEffect({
        variables: { orderBy: sortsOrderBy, where: filtersWhere },
        definition: getRequestOptimisticEffectDefinition,
      });
    },
  });

  const [searchParams] = useSearchParams();
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentView = await snapshot.getPromise(
          currentViewIdScopedState(tableRecoilScopeId),
        );
        if (currentView === viewId) {
          return;
        }

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );
        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState(viewId),
        );

        set(filtersScopedState(tableRecoilScopeId), savedFilters);
        set(sortsScopedState(tableRecoilScopeId), savedSorts);
        set(currentViewIdScopedState(tableRecoilScopeId), viewId);
      },
    [tableRecoilScopeId],
  );

  useEffect(() => {
    const viewId = searchParams.get('view');
    if (viewId) {
      handleViewSelect(viewId);
    }
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [
    handleViewSelect,
    searchParams,
    setActionBarEntries,
    setContextMenuEntries,
  ]);

  return <></>;
};
