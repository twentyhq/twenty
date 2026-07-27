import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type MetadataStoreDraftUtils = Pick<
  ReturnType<typeof useUpdateMetadataStoreDraft>,
  'addToDraft' | 'updateInDraft' | 'removeFromDraft'
>;

type PerformViewEntityAPIPersistOperationArgs<TResponse> = {
  persist: () => Promise<TResponse>;
  applyResultToDraft: (
    response: TResponse,
    draftUtils: MetadataStoreDraftUtils,
  ) => void;
  operationType: CrudOperationType;
};

type PerformViewEntityAPIPersistBatchOperationArgs<TInput, TResult> = {
  inputs: TInput[];
  mutate: (input: TInput) => Promise<TResult>;
  applyResultToDraft: (
    fulfilledMutations: { input: TInput; result: TResult }[],
    draftUtils: MetadataStoreDraftUtils,
  ) => void;
  operationType: CrudOperationType;
};

export const usePerformViewEntityAPIPersistOperation = (
  metadataName: AllMetadataName,
) => {
  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const handlePersistError = useCallback(
    (error: unknown, operationType: CrudOperationType) => {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: metadataName,
          operationType,
        });
      } else {
        enqueueErrorSnackBar({ message: t`An error occurred.` });
      }
    },
    [handleMetadataError, enqueueErrorSnackBar, metadataName],
  );

  const performViewEntityAPIPersistOperation = useCallback(
    async <TResponse>({
      persist,
      applyResultToDraft,
      operationType,
    }: PerformViewEntityAPIPersistOperationArgs<TResponse>): Promise<
      MetadataRequestResult<TResponse>
    > => {
      try {
        const response = await persist();

        applyResultToDraft(response, {
          addToDraft,
          updateInDraft,
          removeFromDraft,
        });
        applyChanges();

        return {
          status: 'successful',
          response,
        };
      } catch (error) {
        handlePersistError(error, operationType);

        return {
          status: 'failed',
          error,
        };
      }
    },
    [
      addToDraft,
      updateInDraft,
      removeFromDraft,
      applyChanges,
      handlePersistError,
    ],
  );

  const performViewEntityAPIPersistBatchOperation = useCallback(
    async <TInput, TResult>({
      inputs,
      mutate,
      applyResultToDraft,
      operationType,
    }: PerformViewEntityAPIPersistBatchOperationArgs<TInput, TResult>): Promise<
      MetadataRequestResult<TResult[]>
    > => {
      if (inputs.length === 0) {
        return {
          status: 'successful',
          response: [],
        };
      }

      const settledMutations = await Promise.allSettled(inputs.map(mutate));

      const fulfilledMutations = settledMutations.flatMap(
        (settledMutation, index) =>
          settledMutation.status === 'fulfilled'
            ? [{ input: inputs[index], result: settledMutation.value }]
            : [],
      );

      applyResultToDraft(fulfilledMutations, {
        addToDraft,
        updateInDraft,
        removeFromDraft,
      });
      applyChanges();

      const firstRejectedMutation = settledMutations.find(
        (settledMutation) => settledMutation.status === 'rejected',
      );

      if (isDefined(firstRejectedMutation)) {
        const error = firstRejectedMutation.reason;

        handlePersistError(error, operationType);

        return {
          status: 'failed',
          error,
        };
      }

      return {
        status: 'successful',
        response: fulfilledMutations.map(({ result }) => result),
      };
    },
    [
      addToDraft,
      updateInDraft,
      removeFromDraft,
      applyChanges,
      handlePersistError,
    ],
  );

  return {
    performViewEntityAPIPersistOperation,
    performViewEntityAPIPersistBatchOperation,
  };
};
