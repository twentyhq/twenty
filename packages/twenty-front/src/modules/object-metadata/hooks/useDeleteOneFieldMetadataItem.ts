import { useMutation } from '@apollo/client';

import {
  DeleteOneFieldMetadataItemMutation,
  DeleteOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecoilState } from 'recoil';
import { DELETE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

export const useDeleteOneFieldMetadataItem = () => {
  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM);

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [
    recordIndexKanbanAggregateOperation,
    setRecordIndexKanbanAggregateOperation,
  ] = useRecoilState(recordIndexKanbanAggregateOperationState);

  const apolloCoreClient = useApolloCoreClient();

  const resetRecordIndexKanbanAggregateOperation = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    if (recordIndexKanbanAggregateOperation?.fieldMetadataId === idToDelete) {
      setRecordIndexKanbanAggregateOperation({
        operation: AggregateOperations.COUNT,
        fieldMetadataId: null,
      });
    }
    await apolloCoreClient.refetchQueries({
      include: ['FindManyViews'],
    });
  };

  const deleteOneFieldMetadataItem = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    const result = await mutate({
      variables: {
        idToDelete,
      },
    });

    await resetRecordIndexKanbanAggregateOperation(idToDelete);

    await refreshObjectMetadataItems();

    return result;
  };

  return {
    deleteOneFieldMetadataItem,
  };
};
