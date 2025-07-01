import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  ObjectMetadataItemsQuery,
  ObjectMetadataItemsQueryVariables,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

import { FIND_MANY_OBJECT_METADATA_ITEMS } from '../graphql/queries';
import { mapPaginatedObjectMetadataItemsToObjectMetadataItems } from '../utils/mapPaginatedObjectMetadataItemsToObjectMetadataItems';

export const useFindManyObjectMetadataItems = ({
  skip,
}: {
  skip?: boolean;
} = {}) => {
  const { enqueueSnackBar } = useSnackBar();

  const { data, loading, error, refetch } = useQuery<
    ObjectMetadataItemsQuery,
    ObjectMetadataItemsQueryVariables
  >(FIND_MANY_OBJECT_METADATA_ITEMS, {
    skip,
    onError: (error) => {
      logError('useFindManyObjectMetadataItems error : ' + error);
      enqueueSnackBar(`${error.message}`, {
        variant: SnackBarVariant.Error,
      });
    },
  });

  const objectMetadataItems = useMemo(() => {
    return mapPaginatedObjectMetadataItemsToObjectMetadataItems({
      pagedObjectMetadataItems: data,
    });
  }, [data]);

  return {
    objectMetadataItems,
    loading,
    error,
    refetch,
  };
};
