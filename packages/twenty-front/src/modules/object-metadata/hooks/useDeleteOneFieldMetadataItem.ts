import { useMutation } from '@apollo/client';

import {
  type DeleteOneFieldMetadataItemMutation,
  type DeleteOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';
import { useRecoilState } from 'recoil';
import { DELETE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

export const useDeleteOneFieldMetadataItem = () => {
  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM);

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [
    recordIndexKanbanAggregateOperation,
    setRecordIndexKanbanAggregateOperation,
  ] = useRecoilState(recordIndexKanbanAggregateOperationState);

  const resetRecordIndexKanbanAggregateOperation = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
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
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'];
    objectMetadataId: string;
  }) => {
    const result = await mutate({
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
