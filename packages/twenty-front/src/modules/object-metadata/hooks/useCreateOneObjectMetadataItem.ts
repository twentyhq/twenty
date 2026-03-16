import { useMutation } from '@apollo/client/react';
import {
  type CreateObjectInput,
  CreateOneObjectMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
export const useCreateOneObjectMetadataItem = () => {
  const [createOneObjectMetadataItemMutation] = useMutation(
    CreateOneObjectMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const createOneObjectMetadataItem = async (
    input: CreateObjectInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof createOneObjectMetadataItemMutation>>
    >
  > => {
    try {
      const createdObjectMetadata = await createOneObjectMetadataItemMutation({
        variables: {
          input: { object: input },
        },
      });

      return {
        status: 'successful',
        response: createdObjectMetadata,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'objectMetadata',
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
  };

  return {
    createOneObjectMetadataItem,
  };
};
