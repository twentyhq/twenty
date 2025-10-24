import {
  type CreateFieldInput,
  useCreateOneFieldMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

export const useCreateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [createOneFieldMetadataItemMutation] =
    useCreateOneFieldMetadataItemMutation();

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createOneFieldMetadataItem = async (
    input: CreateFieldInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof createOneFieldMetadataItemMutation>>
    >
  > => {
    try {
      const response = await createOneFieldMetadataItemMutation({
        variables: {
          input: {
            field: input,
          },
        },
      });

      await refreshObjectMetadataItems();

      await refreshCoreViewsByObjectMetadataId(input.objectMetadataId);

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (error instanceof ApolloError) {
        handleMetadataError(error, {
          primaryMetadataName: 'fieldMetadata',
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
    createOneFieldMetadataItem,
  };
};
