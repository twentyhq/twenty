import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { useApolloClient } from '@apollo/client';
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
  const apollo = useApolloClient();

  const testsFieldNameOnRootQuery = createApolloStoreFieldName({
    fieldName: objectNamePlural,
    fieldVariables: fieldVariables,
  });

  const extractedCache = apollo.cache.extract() as any;

  const recordIdsInCache: string[] =
    extractedCache?.['ROOT_QUERY']?.[testsFieldNameOnRootQuery]?.edges?.map(
      (edge: RecordGqlRefEdge) => edge.node?.__ref.split(':')[1],
    ) ?? [];

  return { recordIdsInCache };
};
