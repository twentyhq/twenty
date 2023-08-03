import { defaultOrderBy } from '@/people/queries';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/table/types/ViewField';

import { useLoadView } from '../hooks/useLoadView';

export function GenericEntityTableData({
  objectName,
  useGetRequest,
  getRequestResultKey,
  orderBy = defaultOrderBy,
  whereFilters,
  viewFieldDefinitions,
  filterDefinitionArray,
}: {
  objectName: 'company' | 'person';
  useGetRequest: any;
  getRequestResultKey: string;
  orderBy?: any;
  whereFilters?: any;
  viewFieldDefinitions: ViewFieldDefinition<ViewFieldMetadata>[];
  filterDefinitionArray: FilterDefinition[];
}) {
  const setEntityTableData = useSetEntityTableData();

  useLoadView({ objectName, viewFieldDefinitions });

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      setEntityTableData(entities, filterDefinitionArray);
    },
  });

  return <></>;
}
