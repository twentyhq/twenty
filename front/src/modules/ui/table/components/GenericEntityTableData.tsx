import { useEffect } from 'react';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { FilterDefinition } from '@/ui/view-bar/types/FilterDefinition';
import { SortOrder } from '~/generated/graphql';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
  getRequestOptimisticEffectDefinition,
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
  getRequestOptimisticEffectDefinition: OptimisticEffectDefinition<any>;
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
      registerOptimisticEffect({
        variables: { orderBy, where: whereFilters },
        definition: getRequestOptimisticEffectDefinition,
      });
    },
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  return <></>;
}
