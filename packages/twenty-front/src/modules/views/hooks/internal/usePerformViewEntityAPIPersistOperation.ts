import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { type CrudOperationType } from 'twenty-shared/types';

type MetadataStoreDraftUtils = Pick<
  ReturnType<typeof useUpdateMetadataStoreDraft>,
  'addToDraft' | 'updateInDraft' | 'removeFromDraft'
>;

type PerformViewEntityAPIPersistOperationArgs<TResponse> = {
  persist: () => Promise<TResponse>;
  // Writes the mutation response to the metadata store immediately so a
  // subsequent save doesn't diff against stale view data and re-send the
  // same create, which fails server-side on duplicate id
  syncMetadataStore: (
    response: TResponse,
    draftUtils: MetadataStoreDraftUtils,
  ) => void;
  primaryMetadataName: AllMetadataName;
  operationType: CrudOperationType;
};

export const usePerformViewEntityAPIPersistOperation = () => {
  const { addToDraft, updateInDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const performViewEntityAPIPersistOperation = useCallback(
    async <TResponse>({
      persist,
      syncMetadataStore,
      primaryMetadataName,
      operationType,
    }: PerformViewEntityAPIPersistOperationArgs<TResponse>): Promise<
      MetadataRequestResult<TResponse>
    > => {
      try {
        const response = await persist();

        syncMetadataStore(response, {
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
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName,
            operationType,
          });
        } else {
          enqueueErrorSnackBar({ message: t`An error occurred.` });
        }

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
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return { performViewEntityAPIPersistOperation };
};
