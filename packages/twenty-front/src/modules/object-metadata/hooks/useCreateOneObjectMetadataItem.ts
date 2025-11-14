import {
  type CreateObjectInput,
  useCreateOneObjectMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const useCreateOneObjectMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [createOneObjectMetadataItemMutation] =
    useCreateOneObjectMetadataItemMutation();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createOneObjectMetadataItem = async (
    input: CreateObjectInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof createOneObjectMetadataItemMutation>>
    >
  > => {
    try {
      const createdObjectMetadata = await createOneObjectMetadataItemMutation({
        variables: {
          input: { object: input },
        },
      });

      await refreshObjectMetadataItems();

      if (isDefined(createdObjectMetadata.data?.createOneObject?.id)) {
        await refreshCoreViewsByObjectMetadataId(
          createdObjectMetadata.data.createOneObject.id,
        );
      }

      return {
        status: 'successful',
        response: createdObjectMetadata,
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
    createOneObjectMetadataItem,
  };
};
