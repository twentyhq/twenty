import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { OBJECT_RECORD_COUNTS } from '@/object-metadata/graphql/queries';

type ObjectRecordCountsResult = {
  objectRecordCounts: {
    objectNamePlural: string;
    totalCount: number;
  }[];
};

export const useCombinedGetTotalCount = () => {
  // Refetch on mount so counts reflect records added since the page was cached
  const { data } = useQuery<ObjectRecordCountsResult>(OBJECT_RECORD_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });

  const totalCountByObjectMetadataItemNamePlural = useMemo(
    () =>
      Object.fromEntries(
        (data?.objectRecordCounts ?? []).map((item) => [
          item.objectNamePlural,
          item.totalCount,
        ]),
      ),
    [data],
  );

  return {
    totalCountByObjectMetadataItemNamePlural,
  };
};
