import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type ObjectMetadataItemsQuery,
  type ObjectMetadataItemsQueryVariables,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

import { enrichObjectMetadataItemsWithPermissions } from '@/object-metadata/utils/enrichObjectMetadataItemsWithPermissions';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { FIND_MANY_OBJECT_METADATA_ITEMS } from '@/object-metadata/graphql/queries';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '@/object-metadata/utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

export const useFindManyObjectMetadataItems = ({
  skip,
}: {
  skip?: boolean;
} = {}) => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { data, loading, error, refetch } = useQuery<
    ObjectMetadataItemsQuery,
    ObjectMetadataItemsQueryVariables
  >(FIND_MANY_OBJECT_METADATA_ITEMS, {
    skip,
    onError: (error) => {
      logError('useFindManyObjectMetadataItems error : ' + error);
      enqueueErrorSnackBar({
        apolloError: error,
      });
    },
  });

  const objectMetadataItems = useMemo(() => {
    const objectMetadataItemsArray =
      mapPaginatedObjectMetadataItemsToObjectMetadataItems({
        pagedObjectMetadataItems: data,
      });

    return enrichObjectMetadataItemsWithPermissions({
      objectMetadataItems: objectMetadataItemsArray,
      objectPermissionsByObjectMetadataId,
    });
  }, [data, objectPermissionsByObjectMetadataId]);

  return {
    objectMetadataItems,
    loading,
    error,
    refetch,
  };
};
