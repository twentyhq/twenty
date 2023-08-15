import { useEffect } from 'react';

import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import { SortOrder } from '~/generated/graphql';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
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
  orderBy?: any;
  whereFilters?: any;
  filterDefinitionArray: FilterDefinition[];
  setActionBarEntries?: () => void;
  setContextMenuEntries?: () => void;
}) {
  const setEntityTableData = useSetEntityTableData();
  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      setEntityTableData(entities, filterDefinitionArray);
    },
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  return <></>;
}
