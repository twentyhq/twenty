import { useCallback } from 'react';

import { UPDATE_LOGIC_FUNCTION_SOURCE } from '@/logic-functions/graphql/mutations/updateLogicFunctionSource';
import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/createOneLogicFunction';
import { DELETE_ONE_LOGIC_FUNCTION } from '@/settings/logic-functions/graphql/mutations/deleteOneLogicFunction';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/settings/logic-functions/graphql/queries/findManyLogicFunctions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { t } from '@lingui/core/macro';
import { type Sources, CrudOperationType } from 'twenty-shared/types';
import {
  type CreateOneLogicFunctionItemMutation,
  type CreateOneLogicFunctionItemMutationVariables,
  type DeleteOneLogicFunctionMutation,
  type DeleteOneLogicFunctionMutationVariables,
} from '~/generated-metadata/graphql';

type UpdateLogicFunctionSourceMutationVariables = {
  input: { id: string; code: Sources };
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

  const [deleteLogicFunctionMutation] = useMutation<
    DeleteOneLogicFunctionMutation,
    DeleteOneLogicFunctionMutationVariables
  >(DELETE_ONE_LOGIC_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [updateLogicFunctionSourceMutation] = useMutation<
    { updateLogicFunctionSource: boolean },
    UpdateLogicFunctionSourceMutationVariables
  >(UPDATE_LOGIC_FUNCTION_SOURCE, {
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

  const updateLogicFunctionSource = useCallback(
    async (
      variables: UpdateLogicFunctionSourceMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateLogicFunctionSourceMutation>>
      >
    > => {
      try {
        const result = await updateLogicFunctionSourceMutation({
          variables,
          refetchQueries: [
            getOperationName(GET_LOGIC_FUNCTION_SOURCE_CODE) ?? '',
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
    [
      updateLogicFunctionSourceMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
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
            getOperationName(GET_LOGIC_FUNCTION_SOURCE_CODE) ?? '',
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
    updateLogicFunctionSource,
    deleteLogicFunction,
  };
};
