import { useDeleteOneFieldMetadataItemMutation } from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useRecoilState } from 'recoil';

export const useDeleteOneFieldMetadataItem = () => {
  const [deleteOneFieldMetadataItemMutation] =
    useDeleteOneFieldMetadataItemMutation();

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

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
  }) => {
    const result = await deleteOneFieldMetadataItemMutation({
      variables: {
        idToDelete,
      },
    });

    await resetRecordIndexKanbanAggregateOperation(idToDelete);

    await refreshObjectMetadataItems();
    await refreshCoreViewsByObjectMetadataId(objectMetadataId);

    return result;
  };

  return {
    deleteOneFieldMetadataItem,
  };
};
