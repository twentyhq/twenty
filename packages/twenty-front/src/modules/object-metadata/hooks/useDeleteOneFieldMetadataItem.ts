import { useDeleteOneFieldMetadataItemMutation } from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { ApolloError } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';

export const useDeleteOneFieldMetadataItem = () => {
  const [deleteOneFieldMetadataItemMutation] =
    useDeleteOneFieldMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [
    recordIndexKanbanAggregateOperation,
    setRecordIndexKanbanAggregateOperation,
  ] = useRecoilState(recordIndexKanbanAggregateOperationState);

  const resetRecordIndexKanbanAggregateOperation = async (
    idToDelete: string,
  ) => {
    if (recordIndexKanbanAggregateOperation?.fieldMetadataId === idToDelete) {
      setRecordIndexKanbanAggregateOperation({
        operation: AggregateOperations.COUNT,
        fieldMetadataId: null,
      });
    }
  };

  const deleteOneFieldMetadataItem = async ({
    idToDelete,
    objectMetadataId,
  }: {
    idToDelete: string;
    objectMetadataId: string;
  }): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof deleteOneFieldMetadataItemMutation>>
    >
  > => {
    try {
      const response = await deleteOneFieldMetadataItemMutation({
        variables: {
          idToDelete,
        },
      });

      await resetRecordIndexKanbanAggregateOperation(idToDelete);

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
    deleteOneFieldMetadataItem,
  };
};
