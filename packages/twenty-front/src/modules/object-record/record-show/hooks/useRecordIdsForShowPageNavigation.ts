import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useRecordIdsFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useRecordIdsFromFindManyCacheRootQuery';
import isEmpty from 'lodash.isempty';

export const useRecordIdsForShowPageNavigation = ({
  objectNameSingular,
  objectNamePlural,
  fieldVariables,
}: {
  objectNameSingular: string;
  objectNamePlural: string;
  fieldVariables: {
    filter: any;
    orderBy: any;
  };
}) => {
  let recordIds: string[] = [];
  const { recordIdsInCache } = useRecordIdsFromFindManyCacheRootQuery({
    objectNamePlural: objectNamePlural,
    fieldVariables,
  });
  recordIds = recordIdsInCache;

  const { records, loading } = useFindManyRecords({
    filter: fieldVariables.filter,
    orderBy: fieldVariables.orderBy,
    objectNameSingular,
    recordGqlFields: { id: true },
    skip: !isEmpty(recordIdsInCache),
  });

  if (isEmpty(recordIdsInCache)) {
    recordIds = records.map((record) => record.id);
  }

  return { recordIds, loading };
};
