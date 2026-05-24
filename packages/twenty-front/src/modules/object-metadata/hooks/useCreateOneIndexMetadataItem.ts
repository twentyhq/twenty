import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { CrudOperationType } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { type IndexFieldMetadataItem } from '@/object-metadata/types/IndexFieldMetadataItem';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  type CreateIndexInput,
  CreateOneIndexMetadataItemDocument,
} from '~/generated-metadata/graphql';

export const useCreateOneIndexMetadataItem = () => {
  const [createOneIndexMetadataItemMutation] = useMutation(
    CreateOneIndexMetadataItemDocument,
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
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

        // Hydrate indexFieldMetadatas from the input rather than the
        // server's @ResolveField on indexFieldMetadataList: the field-
        // resolver reads from the flat-entity cache which can lag a beat
        // behind the just-run migration and return an empty list, leaving
        // the row labelled blank until a full refresh.
        const hydratedIndexFieldMetadatas: IndexFieldMetadataItem[] =
          indexFieldMetadataList.length === input.fields.length
            ? indexFieldMetadataList.map(
                ({ __typename: _, ...rest }) => rest as IndexFieldMetadataItem,
              )
            : input.fields.map((field, order) => ({
                id: uuidv4(),
                fieldMetadataId: field.fieldMetadataId,
                subFieldName: field.subFieldName ?? undefined,
                order,
                createdAt: createdIndex.createdAt,
                updatedAt: createdIndex.updatedAt,
              }));

        addToDraft({
          key: 'indexMetadataItems',
          items: [
            {
              ...indexData,
              indexFieldMetadatas: hydratedIndexFieldMetadatas,
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
        enqueueErrorSnackBar({ message: t`An error occurred.` });
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
