import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import defaults from 'lodash/defaults';
import { useRecoilValue } from 'recoil';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import {
  SortOrder,
  useGetCompaniesQuery,
  useGetPeopleQuery,
} from '~/generated/graphql';

import { FilterDefinition } from '../../object-filter-dropdown/types/FilterDefinition';
import { SortDefinition } from '../../object-sort-dropdown/types/SortDefinition';
import { useRecordTableScopedStates } from '../hooks/internal/useRecordTableScopedStates';
import { useRecordTable } from '../hooks/useRecordTable';

export const RecordTableEffect = ({
  useGetRequest,
  getRequestResultKey,
  getRequestOptimisticEffectDefinition,

  setActionBarEntries,
  setContextMenuEntries,
}: {
  useGetRequest: typeof useGetCompaniesQuery | typeof useGetPeopleQuery;
  getRequestResultKey: string;
  getRequestOptimisticEffectDefinition: OptimisticEffectDefinition;
  filterDefinitionArray: FilterDefinition[];
  sortDefinitionArray: SortDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) => {
  const { setRecordTableData } = useRecordTable();
  const { tableSortsOrderBySelector, tableFiltersWhereSelector } =
    useRecordTableScopedStates();

  const { registerOptimisticEffect } = useOptimisticEffect({
    objectNameSingular: 'companyV2',
  });

  const tableSortsOrderBy = useRecoilValue(tableSortsOrderBySelector);
  const sortsOrderBy = defaults(tableSortsOrderBy, [
    {
      createdAt: SortOrder.Desc,
    },
  ]);
  const tableFiltersWhere = useRecoilValue(tableFiltersWhereSelector);

  useGetRequest({
    variables: { orderBy: sortsOrderBy, where: tableFiltersWhere },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];

      setRecordTableData(entities);

      registerOptimisticEffect({
        variables: { orderBy: sortsOrderBy, where: tableFiltersWhere },
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
