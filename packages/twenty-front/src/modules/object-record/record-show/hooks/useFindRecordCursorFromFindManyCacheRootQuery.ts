import { RecordGqlRefEdge } from '@/object-record/cache/types/RecordGqlRefEdge';
import { useApolloClient } from '@apollo/client';
import { createApolloStoreFieldName } from '~/utils/createApolloStoreFieldName';

export const useFindRecordCursorFromFindManyCacheRootQuery = ({
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

  const findCursorInCache = (recordId: string) => {
    const extractedCache = apollo.cache.extract() as any;

    const edgesInCache =
      extractedCache?.['ROOT_QUERY']?.[testsFieldNameOnRootQuery]?.edges ?? [];

    return edgesInCache.find(
      (edge: RecordGqlRefEdge) => edge.node?.__ref.split(':')[1] === recordId,
    )?.cursor;
  };

  return { findCursorInCache };
};
