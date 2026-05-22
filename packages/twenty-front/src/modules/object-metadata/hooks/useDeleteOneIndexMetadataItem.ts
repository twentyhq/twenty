import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { DELETE_ONE_INDEX_METADATA_ITEM } from '@/object-metadata/graphql/mutations';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useDeleteOneIndexMetadataItem = () => {
  const [deleteOneIndexMutation] = useMutation(DELETE_ONE_INDEX_METADATA_ITEM);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const deleteOneIndexMetadataItem = async ({
    idToDelete,
  }: {
    idToDelete: string;
  }): Promise<
    MetadataRequestResult<Awaited<ReturnType<typeof deleteOneIndexMutation>>>
  > => {
    try {
      const response = await deleteOneIndexMutation({
        variables: {
          idToDelete,
        },
      });

      removeFromDraft({ key: 'indexMetadataItems', itemIds: [idToDelete] });
      applyChanges();

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'index',
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
    deleteOneIndexMetadataItem,
  };
};
