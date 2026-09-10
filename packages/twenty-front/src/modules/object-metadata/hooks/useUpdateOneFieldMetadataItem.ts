import { useMutation } from '@apollo/client/react';
import {
  type UpdateOneFieldMetadataItemMutationVariables,
  UpdateOneFieldMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';
import { v4 as uuidv4 } from 'uuid';

export const useUpdateOneFieldMetadataItem = () => {
  const [updateOneFieldMetadataItemMutation] = useMutation(
    UpdateOneFieldMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();

  const { enqueueToast } = useToast();
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();

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
      | 'isUnique'
      | 'isSearchable'
      | 'label'
      | 'name'
      | 'defaultValue'
      | 'options'
      | 'settings'
      | 'isLabelSyncedWithName'
      | 'translations'
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

      const updatedField = response.data?.updateOneField;

      if (isDefined(updatedField)) {
        const { __typename, object, ...fieldData } = updatedField;

        updateInDraft('fieldMetadataItems', [
          {
            ...fieldData,
            objectMetadataId: object?.id ?? objectMetadataId,
          } as FlatFieldMetadataItem,
        ]);
        applyChanges();
      }

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
        enqueueToast({ variant: 'error', children: t`An error occurred.` });
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
