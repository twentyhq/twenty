import { useQuery } from '@apollo/client/react';
import { FindManyTimelineActivityTypesDocument } from '~/generated-metadata/graphql';

export const useInstalledTimelineActivityTypes = ({
  isInstalledApplication,
}: {
  isInstalledApplication: boolean;
}) => {
  const { data, loading } = useQuery(FindManyTimelineActivityTypesDocument, {
    skip: !isInstalledApplication,
  });

  return {
    installedTimelineActivityTypes: data?.timelineActivityTypes ?? [],
    loading,
  };
};
