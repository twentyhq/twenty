import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CREATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/createOneServerlessFunction';
import { DELETE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/deleteOneServerlessFunction';
import { UPDATE_ONE_SERVERLESS_FUNCTION } from '@/settings/serverless-functions/graphql/mutations/updateOneServerlessFunction';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE } from '@/settings/serverless-functions/graphql/queries/findOneServerlessFunctionSourceCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { t } from '@lingui/core/macro';
import {
  type CreateOneServerlessFunctionItemMutation,
  type CreateOneServerlessFunctionItemMutationVariables,
  type DeleteOneServerlessFunctionMutation,
  type DeleteOneServerlessFunctionMutationVariables,
  type UpdateOneServerlessFunctionMutation,
  type UpdateOneServerlessFunctionMutationVariables,
} from '~/generated-metadata/graphql';

export const usePersistServerlessFunction = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [createServerlessFunctionMutation] = useMutation<
    CreateOneServerlessFunctionItemMutation,
    CreateOneServerlessFunctionItemMutationVariables
  >(CREATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [updateServerlessFunctionMutation] = useMutation<
    UpdateOneServerlessFunctionMutation,
    UpdateOneServerlessFunctionMutationVariables
  >(UPDATE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const [deleteServerlessFunctionMutation] = useMutation<
    DeleteOneServerlessFunctionMutation,
    DeleteOneServerlessFunctionMutationVariables
  >(DELETE_ONE_SERVERLESS_FUNCTION, {
    client: apolloMetadataClient,
  });

  const createServerlessFunction = useCallback(
    async (
      variables: CreateOneServerlessFunctionItemMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof createServerlessFunctionMutation>>
      >
    > => {
      try {
        const result = await createServerlessFunctionMutation({
          variables,
          awaitRefetchQueries: true,
          refetchQueries: [
            getOperationName(FIND_MANY_SERVERLESS_FUNCTIONS) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'serverlessFunction',
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
      createServerlessFunctionMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const updateServerlessFunction = useCallback(
    async (
      variables: UpdateOneServerlessFunctionMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof updateServerlessFunctionMutation>>
      >
    > => {
      try {
        const result = await updateServerlessFunctionMutation({
          variables,
          refetchQueries: [
            getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'serverlessFunction',
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
      updateServerlessFunctionMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  const deleteServerlessFunction = useCallback(
    async (
      variables: DeleteOneServerlessFunctionMutationVariables,
    ): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof deleteServerlessFunctionMutation>>
      >
    > => {
      try {
        const result = await deleteServerlessFunctionMutation({
          variables,
          awaitRefetchQueries: true,
          refetchQueries: [
            getOperationName(FIND_ONE_SERVERLESS_FUNCTION_SOURCE_CODE) ?? '',
          ],
        });

        return {
          status: 'successful',
          response: result,
        };
      } catch (error) {
        if (error instanceof ApolloError) {
          handleMetadataError(error, {
            primaryMetadataName: 'serverlessFunction',
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
      deleteServerlessFunctionMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return {
    createServerlessFunction,
    updateServerlessFunction,
    deleteServerlessFunction,
  };
};
