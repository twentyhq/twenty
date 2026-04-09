import { useMutation } from '@apollo/client/react';
import { DeleteOneFieldMetadataItemDocument } from '~/generated-metadata/graphql';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

export const useDeleteOneFieldMetadataItem = () => {
  const [deleteOneFieldMetadataItemMutation] = useMutation(
    DeleteOneFieldMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const setRecordIndexGroupAggregateOperation = useSetAtomComponentState(
    recordIndexGroupAggregateOperationComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const setRecordIndexGroupAggregateFieldMetadataItem =
    useSetAtomComponentState(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
      MAIN_CONTEXT_STORE_INSTANCE_ID,
    );

  const resetRecordIndexKanbanAggregateOperation = async (
    idToDelete: string,
  ) => {
    if (recordIndexGroupAggregateFieldMetadataItem?.id === idToDelete) {
      setRecordIndexGroupAggregateOperation(AggregateOperations.COUNT);
      setRecordIndexGroupAggregateFieldMetadataItem(null);
    }
  };

  const deleteOneFieldMetadataItem = async ({
    idToDelete,
  }: {
    idToDelete: string;
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

      removeFromDraft({ key: 'fieldMetadataItems', itemIds: [idToDelete] });
      applyChanges();

      // TODO: see if we can remove this line altogether
      await resetRecordIndexKanbanAggregateOperation(idToDelete);

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'fieldMetadata',
          operationType: CrudOperationType.DELETE,
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
