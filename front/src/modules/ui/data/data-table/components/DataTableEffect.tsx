import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { FilterDefinition } from '@/ui/data/filter/types/FilterDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import { useView } from '@/views/hooks/useView';
import { useViewInternalStates } from '@/views/hooks/useViewInternalStates';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { filtersWhereScopedSelector } from '../../filter/states/selectors/filtersWhereScopedSelector';
import { SortDefinition } from '../../sort/types/SortDefinition';
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
  const { setCurrentViewId } = useView();
  const { currentViewSortsOrderBy } = useViewInternalStates();

  const sortsOrderBy = defaults(currentViewSortsOrderBy, [
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
