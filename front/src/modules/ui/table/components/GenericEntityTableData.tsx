import { defaultOrderBy } from '@/people/queries';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
  orderBy = defaultOrderBy,
  whereFilters,
  filterDefinitionArray,
}: {
  useGetRequest: any;
  getRequestResultKey: string;
  orderBy?: any;
  whereFilters?: any;
  filterDefinitionArray: FilterDefinition[];
}) {
  const setEntityTableData = useSetEntityTableData();
  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      setEntityTableData(entities, filterDefinitionArray);
    },
  });

  return <></>;
}
