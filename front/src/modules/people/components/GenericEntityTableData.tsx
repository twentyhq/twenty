import { EntityFieldMetadata } from '@/ui/table/types/EntityFieldMetadata';

import { useSetEntityTableData } from '../hooks/useSetEntityTableData';
import { defaultOrderBy } from '../queries';

export function GenericEntityTableData({
  useGetRequest,
  getRequestResultKey,
  orderBy = defaultOrderBy,
  whereFilters,
  fieldMetadataArray,
}: {
  useGetRequest: any;
  getRequestResultKey: string;
  orderBy?: any;
  whereFilters?: any;
  fieldMetadataArray: EntityFieldMetadata[];
}) {
  const setEntityTableData = useSetEntityTableData();

  useGetRequest({
    variables: { orderBy, where: whereFilters },
    onCompleted: (data: any) => {
      const entities = data[getRequestResultKey] ?? [];

      setEntityTableData(entities, fieldMetadataArray);
    },
  });

  return <></>;
}
