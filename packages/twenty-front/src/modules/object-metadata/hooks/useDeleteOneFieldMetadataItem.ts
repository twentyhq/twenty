import { useApolloClient, useMutation } from '@apollo/client';

import {
  DeleteOneFieldMetadataItemMutation,
  DeleteOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItem';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { useRecoilState } from 'recoil';
import { DELETE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';
import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useDeleteOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    DeleteOneFieldMetadataItemMutation,
    DeleteOneFieldMetadataItemMutationVariables
  >(DELETE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient,
  });

  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const [
    recordIndexKanbanAggregateOperation,
    setRecordIndexKanbanAggregateOperation,
  ] = useRecoilState(recordIndexKanbanAggregateOperationState);

  const apolloClient = useApolloClient();

  const resetRecordIndexKanbanAggregateOperation = async (
    idToDelete: DeleteOneFieldMetadataItemMutationVariables['idToDelete'],
  ) => {
    if (recordIndexKanbanAggregateOperation?.fieldMetadataId === idToDelete) {
      setRecordIndexKanbanAggregateOperation({
        operation: AGGREGATE_OPERATIONS.count,
        fieldMetadataId: null,
      });
    }
    await apolloClient.refetchQueries({
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
