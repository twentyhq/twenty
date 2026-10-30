import { useQuery } from '@apollo/client/react';

import { FindManyRelatedRecordPathsDocument } from '~/generated-metadata/graphql';

export const useRelatedRecordPaths = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const { data, loading } = useQuery(FindManyRelatedRecordPathsDocument);

  const relatedRecordPaths = (data?.relatedRecordPaths ?? []).filter(
    (relatedRecordPath) =>
      relatedRecordPath.objectMetadataId === objectMetadataId,
  );

  return { relatedRecordPaths, loading };
};
