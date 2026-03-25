import { useMutation } from '@apollo/client/react';
import {
  type UpdateOneObjectInput,
  UpdateOneObjectMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { CrudOperationType } from 'twenty-shared/types';

// TODO: Slice the Apollo store synchronously in the update function instead of subscribing, so we can use update after read in the same function call
export const useUpdateOneObjectMetadataItem = () => {
  const [updateOneObjectMetadataItemMutation, { loading }] = useMutation(
    UpdateOneObjectMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

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

      const updatedObject = response.data?.updateOneObject;

      if (isDefined(updatedObject)) {
        const { __typename, ...objectData } = updatedObject;

        updateInDraft('objectMetadataItems', [
          objectData as FlatObjectMetadataItem,
        ]);
        applyChanges();
      }

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'objectMetadata',
          operationType: CrudOperationType.UPDATE,
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
