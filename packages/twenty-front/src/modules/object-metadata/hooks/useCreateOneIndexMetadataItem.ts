import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { CrudOperationType } from 'twenty-shared/types';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatIndexMetadataItem } from '@/metadata-store/types/FlatIndexMetadataItem';
import { CREATE_ONE_INDEX_METADATA_ITEM } from '@/object-metadata/graphql/mutations';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { type IndexType } from '~/generated-metadata/graphql';

// Input shape mirrors CreateIndexInput on the server. We don't expose
// isUnique — unique indexes are owned by the field-creation flow.
export type CreateIndexInput = {
  objectMetadataId: string;
  fieldMetadataIds: string[];
  indexType: IndexType;
  indexWhereClause?: string;
};

export const useCreateOneIndexMetadataItem = () => {
  const [createOneIndexMutation] = useMutation(CREATE_ONE_INDEX_METADATA_ITEM);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const createOneIndexMetadataItem = async (
    input: CreateIndexInput,
  ): Promise<
    MetadataRequestResult<Awaited<ReturnType<typeof createOneIndexMutation>>>
  > => {
    try {
      const response = await createOneIndexMutation({
        variables: {
          input: {
            index: input,
          },
        },
      });

      const createdIndex = (
        response.data as
          | {
              createOneIndex?: Omit<FlatIndexMetadataItem, 'objectMetadataId'>;
            }
          | null
          | undefined
      )?.createOneIndex;

      if (isDefined(createdIndex)) {
        addToDraft({
          key: 'indexMetadataItems',
          items: [
            {
              ...createdIndex,
              indexFieldMetadatas: [],
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
