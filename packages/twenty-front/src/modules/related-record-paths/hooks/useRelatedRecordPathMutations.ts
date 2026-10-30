import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import {
  type CreateRelatedRecordPathInput,
  CreateRelatedRecordPathDocument,
  DeleteRelatedRecordPathDocument,
  FindManyRelatedRecordPathsDocument,
} from '~/generated-metadata/graphql';

const REFETCH_OPTIONS = {
  refetchQueries: [{ query: FindManyRelatedRecordPathsDocument }],
  awaitRefetchQueries: true,
};

export const useRelatedRecordPathMutations = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { handleMetadataError } = useMetadataErrorHandler();

  const [createMutation, { loading: isCreating }] = useMutation(
    CreateRelatedRecordPathDocument,
    REFETCH_OPTIONS,
  );
  const [deleteMutation, { loading: isDeleting }] = useMutation(
    DeleteRelatedRecordPathDocument,
    REFETCH_OPTIONS,
  );

  const handleError = (error: unknown, operationType: CrudOperationType) => {
    if (CombinedGraphQLErrors.is(error)) {
      handleMetadataError(error, {
        primaryMetadataName: 'relatedRecordPath',
        operationType,
      });
      return;
    }

    enqueueToast({ status: 'error', children: t`An error occurred.` });
  };

  const createRelatedRecordPath = async (
    input: CreateRelatedRecordPathInput,
  ) => {
    try {
      await createMutation({ variables: { input } });
    } catch (error) {
      handleError(error, CrudOperationType.CREATE);
    }
  };

  const deleteRelatedRecordPath = async (id: string) => {
    try {
      await deleteMutation({ variables: { id } });
    } catch (error) {
      handleError(error, CrudOperationType.DELETE);
    }
  };

  return {
    createRelatedRecordPath,
    deleteRelatedRecordPath,
    isSaving: isCreating || isDeleting,
  };
};
