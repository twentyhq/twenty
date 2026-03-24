import { useMutation } from '@apollo/client/react';
import {
  type CreateFieldInput,
  CreateOneFieldMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { CrudOperationType } from 'twenty-shared/types';

export const useCreateOneFieldMetadataItem = () => {
  const [createOneFieldMetadataItemMutation] = useMutation(
    CreateOneFieldMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const createOneFieldMetadataItem = async (
    input: CreateFieldInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof createOneFieldMetadataItemMutation>>
    >
  > => {
    try {
      const response = await createOneFieldMetadataItemMutation({
        variables: {
          input: {
            field: input,
          },
        },
      });

      const createdField = response.data?.createOneField;

      if (isDefined(createdField)) {
        const { __typename, object, ...fieldData } = createdField;

        addToDraft({
          key: 'fieldMetadataItems',
          items: [
            {
              ...fieldData,
              objectMetadataId: object?.id ?? input.objectMetadataId,
            } as FlatFieldMetadataItem,
          ],
        });
        applyChanges();
      }

      return {
        status: 'successful',
        response,
      };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'fieldMetadata',
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
    createOneFieldMetadataItem,
  };
};
