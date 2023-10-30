import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { useRecoilScopedValue } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedValue';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { FilterDefinition } from '../../object-filter-dropdown/types/FilterDefinition';
import { SortDefinition } from '../../object-sort-dropdown/types/SortDefinition';
import { useSetRecordTableData } from '../hooks/useSetRecordTableData';
import { TableRecoilScopeContext } from '../states/recoil-scope-contexts/TableRecoilScopeContext';
import { tablefiltersWhereScopedSelector } from '../states/selectors/tablefiltersWhereScopedSelector';
import { tableSortsOrderByScopedSelector } from '../states/selectors/tableSortsOrderByScopedSelector';

export const RecordTableEffect = ({
  useGetRequest,
  getRequestResultKey,
  getRequestOptimisticEffectDefinition,

  setActionBarEntries,
  setContextMenuEntries,
}: {
  useGetRequest: typeof useGetCompaniesQuery | typeof useGetPeopleQuery;
  getRequestResultKey: string;
  getRequestOptimisticEffectDefinition: OptimisticEffectDefinition<any>;

  filterDefinitionArray: FilterDefinition[];
  sortDefinitionArray: SortDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) => {
  const setRecordTableData = useSetRecordTableData();
  const { registerOptimisticEffect } = useOptimisticEffect();

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

      setRecordTableData(entities);

      registerOptimisticEffect({
        variables: { orderBy: sortsOrderBy, where: tablefiltersWhere },
        definition: getRequestOptimisticEffectDefinition,
      });
    },
  });

  const [searchParams] = useSearchParams();

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [searchParams, setActionBarEntries, setContextMenuEntries]);

  return <></>;
};
