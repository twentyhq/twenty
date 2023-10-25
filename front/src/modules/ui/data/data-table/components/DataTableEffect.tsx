/* eslint-disable no-console */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';
import { useRecoilCallback } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { sortsScopedState } from '@/ui/data/sort/states/sortsScopedState';
import { filtersScopedState } from '@/ui/data/view-bar/states/filtersScopedState';
import { savedFiltersFamilyState } from '@/ui/data/view-bar/states/savedFiltersFamilyState';
import { FilterDefinition } from '@/ui/data/view-bar/types/FilterDefinition';
import { SortDefinition } from '@/ui/data/view-bar/types/SortDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useRecoilScopeId } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopeId';
import { useView } from '@/views/hooks/useView';
import { currentViewIdScopedState } from '@/views/states/currentViewIdScopedState';
import { savedSortsFamilyState } from '@/views/states/savedSortsScopedFamilyState';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { sortsOrderByScopedSelector } from '../../../../views/states/selectors/sortsOrderByScopedSelector';
import { useSort } from '../../sort/hooks/useSort';
import { filtersWhereScopedSelector } from '../../view-bar/states/selectors/filtersWhereScopedSelector';
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

  const { scopeId: viewScopeId } = useView();

  const { scopeId: sortScopeId } = useSort();

  const [searchParams] = useSearchParams();
  const tableRecoilScopeId = useRecoilScopeId(TableRecoilScopeContext);
  const handleViewSelect = useRecoilCallback(
    ({ set, snapshot }) =>
      async (viewId: string) => {
        const currentView = await snapshot.getPromise(
          currentViewIdScopedState({ scopeId: tableRecoilScopeId }),
        );
        if (currentView === viewId) {
          return;
        }

        const savedFilters = await snapshot.getPromise(
          savedFiltersFamilyState(viewId),
        );

        const savedSorts = await snapshot.getPromise(
          savedSortsFamilyState({
            scopeId: viewScopeId,
            familyKey: viewId,
          }),
        );

        set(filtersScopedState(tableRecoilScopeId), savedFilters);
        set(sortsScopedState({ scopeId: sortScopeId }), savedSorts);
        set(currentViewIdScopedState({ scopeId: tableRecoilScopeId }), viewId);
      },
    [tableRecoilScopeId, viewScopeId, sortScopeId],
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
