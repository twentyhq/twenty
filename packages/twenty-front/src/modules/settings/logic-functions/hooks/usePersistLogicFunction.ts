import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/createOneLogicFunction';
import { DELETE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/deleteOneLogicFunction';
import { UPDATE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/updateOneLogicFunction';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/settings/logic-functions/graphql/queries/findManyLogicFunctions';
import { FIND_ONE_CODE_STEP_SOURCE_CODE } from '@/workflow/workflow-steps/workflow-actions/code-action/graphql/queries/findOneCodeStepSourceCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UPDATE_CODE_STEP_SOURCE } from '@/workflow/workflow-steps/workflow-actions/code-action/graphql/mutations/updateCodeStepSource';
import { ApolloError, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { t } from '@lingui/core/macro';
import { type Sources, CrudOperationType } from 'twenty-shared/types';
import {
  type CreateOneLogicFunctionItemMutation,
  type CreateOneLogicFunctionItemMutationVariables,
  type DeleteOneLogicFunctionMutation,
  type DeleteOneLogicFunctionMutationVariables,
  type UpdateOneLogicFunctionMutation,
  type UpdateOneLogicFunctionMutationVariables,
} from '~/generated-metadata/graphql';

type UpdateCodeStepSourceMutationVariables = {
  input: { logicFunctionId: string; code: Sources };
};

export const usePersistLogicFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [createLogicFunctionMutation] = useMutation<
    CreateOneLogicFunctionItemMutation,
    CreateOneLogicFunctionItemMutationVariables
  >(CREATE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [updateLogicFunctionMutation] = useMutation<
    UpdateOneLogicFunctionMutation,
    UpdateOneLogicFunctionMutationVariables
  >(UPDATE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [deleteLogicFunctionMutation] = useMutation<
    DeleteOneLogicFunctionMutation,
    DeleteOneLogicFunctionMutationVariables
  >(DELETE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [updateCodeStepSourceMutation] = useMutation<
    { updateCodeStepSource: boolean },
    UpdateCodeStepSourceMutationVariables
  >(UPDATE_CODE_STEP_SOURCE, {
    client: apolloMetadataClient,
  });

  const createLogicFunction = useCallback(
    async (
      variables: CreateOneLogicFunctionItemMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createLogicFunctionMutation>>
      >
    > => {
      try {
        const result = await createLogicFunctionMutation({
          variables,
          awaitRefetchQueries: true,
          refetchQueries: [getOperationName(FIND_MANY_LOGIC_FUNCTIONS) ?? ''],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
            operationType: CrudOperationType.CREATE,
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
    [createLogicFunctionMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const updateLogicFunction = useCallback(
    async (
      variables: UpdateOneLogicFunctionMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateLogicFunctionMutation>>
      >
    > => {
      try {
        const result = await updateLogicFunctionMutation({
          variables,
          refetchQueries: [
            getOperationName(FIND_ONE_CODE_STEP_SOURCE_CODE) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
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
    },
    [updateLogicFunctionMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const updateCodeStepSource = useCallback(
    async (
      variables: UpdateCodeStepSourceMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateCodeStepSourceMutation>>
      >
    > => {
      try {
        const result = await updateCodeStepSourceMutation({
          variables,
          refetchQueries: [
            getOperationName(FIND_ONE_CODE_STEP_SOURCE_CODE) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
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
    },
    [updateCodeStepSourceMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  const deleteLogicFunction = useCallback(
    async (
      variables: DeleteOneLogicFunctionMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteLogicFunctionMutation>>
      >
    > => {
      try {
        const result = await deleteLogicFunctionMutation({
          variables,
          awaitRefetchQueries: true,
          refetchQueries: [
            getOperationName(FIND_ONE_CODE_STEP_SOURCE_CODE) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
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
    },
    [deleteLogicFunctionMutation, handleMetadataError, enqueueErrorSnackBar],
  );

  return {
    createLogicFunction,
    updateLogicFunction,
    updateCodeStepSource,
    deleteLogicFunction,
  };
};
