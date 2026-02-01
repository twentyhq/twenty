import { useCallback } from 'react';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { UPLOAD_LOGIC_FUNCTION_SOURCE_CODE } from '@/settings/logic-functions/graphql/mutations/uploadLogicFunctionSourceCode';
import { FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE } from '@/settings/logic-functions/graphql/queries/findOneLogicFunctionSourceCode';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ApolloError, useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { t } from '@lingui/core/macro';
import { type Sources } from 'twenty-shared/types';
import { CrudOperationType } from 'twenty-shared/types';
import {
  type UploadLogicFunctionSourceCodeMutation,
  type UploadLogicFunctionSourceCodeMutationVariables,
} from '~/generated-metadata/graphql';

export const useUploadLogicFunctionSourceCode = () => {
  const apolloMetadataClient = useApolloCoreClient();
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [uploadLogicFunctionSourceCodeMutation] = useMutation<
    UploadLogicFunctionSourceCodeMutation,
    UploadLogicFunctionSourceCodeMutationVariables
  >(UPLOAD_LOGIC_FUNCTION_SOURCE_CODE, {
    client: apolloMetadataClient,
  });

  const uploadLogicFunctionSourceCode = useCallback(
    async (variables: {
      id: string;
      code: Sources;
    }): Promise<
      MetadataRequestResult<
        Awaited<ReturnType<typeof uploadLogicFunctionSourceCodeMutation>>
      >
    > => {
      try {
        const result = await uploadLogicFunctionSourceCodeMutation({
          variables: {
            input: variables,
          },
          refetchQueries: [
            getOperationName(FIND_ONE_LOGIC_FUNCTION_SOURCE_CODE) ?? '',
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
      uploadLogicFunctionSourceCodeMutation,
      handleMetadataError,
      enqueueErrorSnackBar,
    ],
  );

  return {
    uploadLogicFunctionSourceCode,
  };
};
