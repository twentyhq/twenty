import { useMutation } from '@apollo/client/react';
import { DeleteOneObjectMetadataItemDocument } from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useInvalidateMetadataStore } from '@/metadata-store/hooks/useInvalidateMetadataStore';
import { useRemoveObjectMetadataItemFromDraft } from '@/metadata-store/hooks/useRemoveObjectMetadataItemFromDraft';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';

export const useDeleteOneObjectMetadataItem = () => {
  const [deleteOneObjectMetadataItemMutation] = useMutation(
    DeleteOneObjectMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();
  const { applyChanges } = useUpdateMetadataStoreDraft();
  const { invalidateMetadataStore } = useInvalidateMetadataStore();
  const { removeObjectMetadataItemFromDraft } =
    useRemoveObjectMetadataItemFromDraft();

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

      removeObjectMetadataItemFromDraft({ objectMetadataId: idToDelete });
      applyChanges();

      invalidateMetadataStore();

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
        enqueueToast({ status: 'error', children: t`An error occurred.` });
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
