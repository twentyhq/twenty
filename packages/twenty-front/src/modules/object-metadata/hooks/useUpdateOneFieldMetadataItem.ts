import { useMutation } from '@apollo/client/react';
import {
  type UpdateOneFieldMetadataItemMutationVariables,
  UpdateOneFieldMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export const useUpdateOneFieldMetadataItem = () => {
  const [updateOneFieldMetadataItemMutation] = useMutation(
    UpdateOneFieldMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();

  const { enqueueErrorSnackBar } = useSnackBar();

  const setLastFieldMetadataItemUpdate = useSetAtomState(
    lastFieldMetadataItemUpdateState,
  );

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

      setLastFieldMetadataItemUpdate({
        fieldMetadataItemId: fieldMetadataIdToUpdate,
        objectMetadataId,
        id: uuidv4(),
      });

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'fieldMetadata',
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
    updateOneFieldMetadataItem,
  };
};
