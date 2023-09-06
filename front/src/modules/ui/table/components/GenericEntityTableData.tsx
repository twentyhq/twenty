import { useEffect } from 'react';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffect } from '@/apollo/optimistic-effect/types/OptimisticEffect';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { FilterDefinition } from '@/ui/view-bar/types/FilterDefinition';
import { SortOrder } from '~/generated/graphql';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
  getRequestOptimisticEffect,
  orderBy = [
    {
      createdAt: SortOrder.Desc,
    },
  ],
  whereFilters,
  filterDefinitionArray,
  setActionBarEntries,
  setContextMenuEntries,
}: {
  useGetRequest: any;
  getRequestResultKey: string;
  getRequestOptimisticEffect: (variables: any) => OptimisticEffect<any, any>;
  orderBy?: any;
  whereFilters?: any;
  filterDefinitionArray: FilterDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) {
  const setEntityTableData = useSetEntityTableData();
  const { registerOptimisticEffect } = useOptimisticEffect();

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      setEntityTableData(entities, filterDefinitionArray);
      registerOptimisticEffect(
        getRequestOptimisticEffect({ orderBy, where: whereFilters }),
      );
    },
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  return <></>;
}
