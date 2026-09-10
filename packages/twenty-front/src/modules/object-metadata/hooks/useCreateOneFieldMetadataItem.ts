import { useMutation } from '@apollo/client/react';
import {
  type CreateFieldInput,
  CreateOneFieldMetadataItemDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/feedback';

export const useCreateOneFieldMetadataItem = () => {
  const [createOneFieldMetadataItemMutation] = useMutation(
    CreateOneFieldMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { add: addToast } = useToast();
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
        addToast({ variant: 'error', children: t`An error occurred.` });
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
