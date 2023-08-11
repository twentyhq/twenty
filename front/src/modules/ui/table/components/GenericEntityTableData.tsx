import { defaultOrderBy } from '@/people/queries';
import {
  ViewFieldDefinition,
  ViewFieldMetadata,
} from '@/ui/editable-field/types/ViewField';
import { FilterDefinition } from '@/ui/filter-n-sort/types/FilterDefinition';
import { useSetEntityTableData } from '@/ui/table/hooks/useSetEntityTableData';

import { useLoadViewFields } from '../hooks/useLoadViewFields';

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

  useLoadViewFields({ objectName, viewFieldDefinitions });

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];
      setEntityTableData(entities, filterDefinitionArray);
    },
  });

  return <></>;
}
