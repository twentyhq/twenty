import { useDeleteOneObjectMetadataItemMutation } from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshAllCoreViews } from '@/views/hooks/useRefreshAllCoreViews';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

export const useDeleteOneObjectMetadataItem = () => {
  const [deleteOneObjectMetadataItemMutation] =
    useDeleteOneObjectMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshAllCoreViews } = useRefreshAllCoreViews();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const deleteOneObjectMetadataItem = async (
    idToDelete: string,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof deleteOneObjectMetadataItemMutation>>
    >
  > => {
    try {
      const response = await deleteOneObjectMetadataItemMutation({
        variables: {
          idToDelete,
        },
      });

      await refreshObjectMetadataItems();
      await refreshAllCoreViews();

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (error instanceof ApolloError) {
        handleMetadataError(error, {
          primaryMetadataName: 'objectMetadata',
        });
      } else {
        enqueueErrorSnackBar({ message: t`An error occurred.` });
      }

      return {
        status: 'failed',
        error,
      };
    }
  };

  return {
    deleteOneObjectMetadataItem,
  };
};
