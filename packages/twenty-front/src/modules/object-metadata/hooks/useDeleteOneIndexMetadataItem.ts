import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useToast } from 'twenty-ui/feedback';
import { DeleteOneIndexMetadataItemDocument } from '~/generated-metadata/graphql';

export const useDeleteOneIndexMetadataItem = () => {
  const [deleteOneIndexMetadataItemMutation] = useMutation(
    DeleteOneIndexMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const deleteOneIndexMetadataItem = async ({
    idToDelete,
  }: {
    idToDelete: string;
  }): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof deleteOneIndexMetadataItemMutation>>
    >
  > => {
    try {
      const response = await deleteOneIndexMetadataItemMutation({
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
        addToast({ variant: 'error', children: t`An error occurred.` });
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
