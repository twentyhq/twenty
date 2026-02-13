import { useCallback } from 'react';

import { UPDATE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/updateOneLogicFunction';
import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/createOneLogicFunction';
import { DELETE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/deleteOneLogicFunction';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/logic-functions/graphql/queries/findManyLogicFunctions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type CreateOneLogicFunctionMutation,
  type CreateOneLogicFunctionMutationVariables,
  type DeleteOneLogicFunctionMutation,
  type DeleteOneLogicFunctionMutationVariables,
  type UpdateOneLogicFunctionMutation,
  type UpdateOneLogicFunctionMutationVariables,
} from '~/generated-metadata/graphql';

export const usePersistLogicFunction = () => {
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [createLogicFunctionMutation] = useMutation<
    CreateOneLogicFunctionMutation,
    CreateOneLogicFunctionMutationVariables
  >(CREATE_ONE_LOGIC_FUNCTION);

  const [deleteLogicFunctionMutation] = useMutation<
    DeleteOneLogicFunctionMutation,
    DeleteOneLogicFunctionMutationVariables
  >(DELETE_ONE_LOGIC_FUNCTION);

  const [updateLogicFunctionSourceMutation] = useMutation<
    UpdateOneLogicFunctionMutation,
    UpdateOneLogicFunctionMutationVariables
  >(UPDATE_ONE_LOGIC_FUNCTION);

  const createLogicFunction = useCallback(
    async (
      variables: CreateOneLogicFunctionMutationVariables,
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
        Awaited<ReturnType<typeof updateLogicFunctionSourceMutation>>
      >
    > => {
      try {
        const result = await updateLogicFunctionSourceMutation({
          variables,
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
    updateLogicFunction,
    deleteLogicFunction,
  };
};
