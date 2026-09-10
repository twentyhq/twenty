import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useToast } from 'twenty-ui/feedback';
import {
  type CreateIndexInput,
  CreateOneIndexMetadataItemDocument,
} from '~/generated-metadata/graphql';

export const useCreateOneIndexMetadataItem = () => {
  const [createOneIndexMetadataItemMutation] = useMutation(
    CreateOneIndexMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const createOneIndexMetadataItem = async (
    input: CreateIndexInput,
  ): Promise<
    MetadataRequestResult<
      Awaited<ReturnType<typeof createOneIndexMetadataItemMutation>>
    >
  > => {
    try {
      const response = await createOneIndexMetadataItemMutation({
        variables: {
          input: {
            index: input,
          },
        },
      });

      const createdIndex = response.data?.createOneIndex;

      if (isDefined(createdIndex)) {
        const { __typename, indexFieldMetadataList, ...indexData } =
          createdIndex;

        const indexFieldMetadatas: IndexFieldMetadataItem[] =
          indexFieldMetadataList.map(
            ({ __typename: _, ...rest }) => rest as IndexFieldMetadataItem,
          );

        addToDraft({
          key: 'indexMetadataItems',
          items: [
            {
              ...indexData,
              indexFieldMetadatas,
              objectMetadataId: input.objectMetadataId,
            } as FlatIndexMetadataItem,
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
          primaryMetadataName: 'index',
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
  };

  return {
    createOneIndexMetadataItem,
  };
};
