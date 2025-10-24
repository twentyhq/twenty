import {
  useUpdateOneObjectMetadataItemMutation,
  type UpdateOneObjectInput,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const [updateOneObjectMetadataItemMutation, { loading }] =
    useUpdateOneObjectMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const updateOneObjectMetadataItem = async ({
    idToUpdate,
    updatePayload,
  }: {
    idToUpdate: UpdateOneObjectInput['id'];
    updatePayload: UpdateOneObjectInput['update'];
  }): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof updateOneObjectMetadataItemMutation>>
    >
  > => {
    try {
      const response = await updateOneObjectMetadataItemMutation({
        variables: {
          idToUpdate,
          updatePayload,
        },
      });

      await refreshObjectMetadataItems();
      await refreshCoreViewsByObjectMetadataId(idToUpdate);

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
    updateOneObjectMetadataItem,
    loading,
  };
};
