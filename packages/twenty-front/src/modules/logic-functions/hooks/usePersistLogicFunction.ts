import { useCallback } from 'react';

import { CREATE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/createOneLogicFunction';
import { DELETE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/deleteOneLogicFunction';
import { UPDATE_ONE_LOGIC_FUNCTION } from '@/logic-functions/graphql/mutations/updateOneLogicFunction';
import { FIND_MANY_LOGIC_FUNCTIONS } from '@/logic-functions/graphql/queries/findManyLogicFunctions';
import { GET_LOGIC_FUNCTION_SOURCE_CODE } from '@/logic-functions/graphql/queries/getLogicFunctionSourceCode';
import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/feedback';
import {
  type CreateOneLogicFunctionMutation,
  type CreateOneLogicFunctionMutationVariables,
  type DeleteOneLogicFunctionMutation,
  type DeleteOneLogicFunctionMutationVariables,
  type UpdateOneLogicFunctionMutation,
  type UpdateOneLogicFunctionMutationVariables,
} from '~/generated-metadata/graphql';
import { getOperationName } from '~/utils/getOperationName';

export const usePersistLogicFunction = () => {
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();

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
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
            operationType: CrudOperationType.CREATE,
          });
        } else {
          enqueueToast({ variant: 'error', children: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [createLogicFunctionMutation, handleMetadataError, enqueueToast],
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
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
            operationType: CrudOperationType.UPDATE,
          });
        } else {
          enqueueToast({ variant: 'error', children: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [updateLogicFunctionSourceMutation, handleMetadataError, enqueueToast],
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
        if (CombinedGraphQLErrors.is(error)) {
          handleMetadataError(error, {
            primaryMetadataName: 'logicFunction',
            operationType: CrudOperationType.DELETE,
          });
        } else {
          enqueueToast({ variant: 'error', children: t`An error occurred.` });
        }

        return {
          status: 'failed',
          error,
        };
      }
    },
    [deleteLogicFunctionMutation, handleMetadataError, enqueueToast],
  );

  return {
    createLogicFunction,
    updateLogicFunction,
    deleteLogicFunction,
  };
};
