import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { OBJECT_RECORD_COUNTS } from '@/object-metadata/graphql/queries';

type ObjectRecordCountsResult = {
  objectRecordCounts: {
    objectNamePlural: string;
    totalCount: number;
  }[];
};

export const useCombinedGetTotalCount = () => {
  const { data } = useQuery<ObjectRecordCountsResult>(OBJECT_RECORD_COUNTS);

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
