import { useQuery } from '@apollo/client/react';

import { type ShareRecordModalTarget } from '@/record-share/types/ShareRecordModalTarget';
import { RecordSharesDocument } from '~/generated-metadata/graphql';

export const useRecordShares = ({
  objectMetadataId,
  recordId,
}: ShareRecordModalTarget) => {
  const { data, loading, error } = useQuery(RecordSharesDocument, {
    variables: { objectMetadataId, recordId },
  });

  return {
    data,
    shares: data?.recordShares.shares ?? [],
    viewerAccessLevel: data?.recordShares.viewerAccessLevel ?? null,
    loading,
    error,
  };
};
