import {
  type UpdateOneFieldMetadataItemMutationVariables,
  useUpdateOneFieldMetadataItemMutation,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { lastFieldMetadataItemUpdateState } from '@/object-metadata/states/lastFieldMetadataItemUpdateState';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useSetRecoilState } from 'recoil';
import { CrudOperationType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export const useUpdateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [updateOneFieldMetadataItemMutation] =
    useUpdateOneFieldMetadataItemMutation();

  const { handleMetadataError } = useMetadataErrorHandler();

  const { enqueueErrorSnackBar } = useSnackBar();

  const setLastFieldMetadataItemUpdate = useSetRecoilState(
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

      await refreshObjectMetadataItems();
      await refreshCoreViewsByObjectMetadataId(objectMetadataId);

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
      if (error instanceof ApolloError) {
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
