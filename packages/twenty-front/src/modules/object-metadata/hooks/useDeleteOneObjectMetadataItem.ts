import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  DeleteOneObjectMetadataItemDocument,
  FindManyCommandMenuItemsDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

export const useDeleteOneObjectMetadataItem = () => {
  const [deleteOneObjectMetadataItemMutation] = useMutation(
    DeleteOneObjectMetadataItemDocument,
  );

  const client = useApolloClient();
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { removeFromDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

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

      removeFromDraft({ key: 'objectMetadataItems', itemIds: [idToDelete] });
      applyChanges();

      const commandMenuItemsResult = await client.query({
        query: FindManyCommandMenuItemsDocument,
        fetchPolicy: 'network-only',
      });

      replaceDraft(
        'commandMenuItems',
        commandMenuItemsResult.data?.commandMenuItems ?? [],
      );
      applyChanges();

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'objectMetadata',
          operationType: CrudOperationType.DELETE,
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
