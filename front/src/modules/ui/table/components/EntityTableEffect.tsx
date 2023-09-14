import { useEffect } from 'react';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { FilterDefinition } from '@/ui/view-bar/types/FilterDefinition';
import { SortDefinition } from '@/ui/view-bar/types/SortDefinition';
import { SortOrder } from '~/generated/graphql';

export function EntityTableEffect({
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
  sortDefinitionArray,
}: {
  // TODO: type this
  useGetRequest: any;
  getRequestResultKey: string;
  getRequestOptimisticEffectDefinition: OptimisticEffectDefinition<any>;
  // TODO: type this and replace with defaultSorts reduce should be applied to defaultSorts in this component not before
  orderBy?: any;
  // TODO: type this and replace with defaultFilters reduce should be applied to defaultFilters in this component not before
  whereFilters?: any;
  filterDefinitionArray: FilterDefinition[];
  sortDefinitionArray: SortDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) {
  const setEntityTableData = useSetEntityTableData();
  const { registerOptimisticEffect } = useOptimisticEffect();

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];

      setEntityTableData(entities, filterDefinitionArray, sortDefinitionArray);

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
