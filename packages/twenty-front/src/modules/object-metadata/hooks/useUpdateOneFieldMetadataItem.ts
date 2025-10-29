import {
  type UpdateOneFieldMetadataItemMutationVariables,
  useUpdateOneFieldMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';

export const useUpdateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [updateOneFieldMetadataItemMutation] =
    useUpdateOneFieldMetadataItemMutation();

  const { handleMetadataError } = useMetadataErrorHandler();

  const { enqueueErrorSnackBar } = useSnackBar();

  const updateOneFieldMetadataItem = async ({
    objectMetadataId,
    fieldMetadataIdToUpdate,
    updatePayload,
  }: {
    objectMetadataId: string;
    fieldMetadataIdToUpdate: UpdateOneFieldMetadataItemMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneFieldMetadataItemMutationVariables['updatePayload'],
      | 'description'
      | 'icon'
      | 'isActive'
      | 'label'
      | 'name'
      | 'defaultValue'
      | 'options'
      | 'isLabelSyncedWithName'
    >;
  }): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof updateOneFieldMetadataItemMutation>>
    >
  > => {
    try {
      const response = await updateOneFieldMetadataItemMutation({
        variables: {
          idToUpdate: fieldMetadataIdToUpdate,
          updatePayload: updatePayload,
        },
      });

      await refreshObjectMetadataItems();
      await refreshCoreViewsByObjectMetadataId(objectMetadataId);

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
    updateOneFieldMetadataItem,
  };
};
