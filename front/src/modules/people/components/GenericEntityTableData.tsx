import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { ViewFieldDefinition } from '@/ui/table/types/ViewField';

import { useSetEntityTableData } from '../hooks/useSetEntityTableData';
import { defaultOrderBy } from '../queries';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
  orderBy = defaultOrderBy,
  whereFilters,
  fieldMetadataArray,
  filterDefinitionArray,
}: {
  useGetRequest: any;
  getRequestResultKey: string;
  orderBy?: any;
  whereFilters?: any;
  fieldMetadataArray: ViewFieldDefinition<unknown>[];
  filterDefinitionArray: FilterDefinition[];
}) {
  const setEntityTableData = useSetEntityTableData();

  console.log({ fieldMetadataArray });

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      console.log({ entities });

      setEntityTableData(entities, fieldMetadataArray, filterDefinitionArray);
    },
  });

  return <></>;
}
