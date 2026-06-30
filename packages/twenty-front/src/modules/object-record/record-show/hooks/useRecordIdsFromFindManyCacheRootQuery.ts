import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { createApolloStoreFieldName } from '~/utils/createApolloStoreFieldName';

export const useRecordIdsFromFindManyCacheRootQuery = ({
  objectNamePlural,
  fieldVariables,
}: {
  objectNamePlural: string;
  fieldVariables: {
    filter: any;
    orderBy: any;
  };
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const testsFieldNameOnRootQuery = createApolloStoreFieldName({
    fieldName: objectNamePlural,
    fieldVariables: fieldVariables,
  });

  const extractedCache = apolloCoreClient.cache.extract() as any;

  const recordIdsInCache: string[] =
    extractedCache?.['ROOT_QUERY']?.[testsFieldNameOnRootQuery]?.edges?.map(
      (edge: RecordGqlRefEdge) => edge.node?.__ref.split(':')[1],
    ) ?? [];

  return { recordIdsInCache };
};
