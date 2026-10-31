import { useQuery } from '@apollo/client/react';
import { useCallback } from 'react';

import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import {
  AllMetadataName,
  FindManyRelatedRecordPathsDocument,
} from '~/generated-metadata/graphql';

export const useRelatedRecordPaths = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading, error, refetch } = useQuery(
    FindManyRelatedRecordPathsDocument,
  );

  const refetchOnRelatedRecordPathOperation = useCallback(() => {
    void refetch();
  }, [refetch]);

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.relatedRecordPath,
    onMetadataOperationBrowserEvent: refetchOnRelatedRecordPathOperation,
  });

  const relatedRecordPaths = (data?.relatedRecordPaths ?? []).filter(
    (relatedRecordPath) =>
      relatedRecordPath.objectMetadataId === objectMetadataId,
  );

  return { relatedRecordPaths, loading, error };
};
