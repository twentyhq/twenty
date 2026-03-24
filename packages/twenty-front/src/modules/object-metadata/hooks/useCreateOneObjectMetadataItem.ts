import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  type CreateObjectInput,
  CreateOneObjectMetadataItemDocument,
  FindManyNavigationMenuItemsDocument,
  FindManyViewsDocument,
} from '~/generated-metadata/graphql';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatFieldMetadataItem } from '@/metadata-store/types/FlatFieldMetadataItem';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { splitViewWithRelated } from '@/metadata-store/utils/splitViewWithRelated';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useCreateOneObjectMetadataItem = () => {
  const [createOneObjectMetadataItemMutation] = useMutation(
    CreateOneObjectMetadataItemDocument,
  );

  const client = useApolloClient();
  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { addToDraft, replaceDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

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

      const createdObject = createdObjectMetadata.data?.createOneObject;

      if (isDefined(createdObject)) {
        const {
          __typename: _objectTypename,
          fieldsList,
          ...objectData
        } = createdObject;

        addToDraft({
          key: 'objectMetadataItems',
          items: [objectData as FlatObjectMetadataItem],
        });

        const flatFields = fieldsList.map((field) => {
          const { __typename: _fieldTypename, ...fieldData } = field;

          return {
            ...fieldData,
            objectMetadataId: createdObject.id,
          } as FlatFieldMetadataItem;
        });

        addToDraft({ key: 'fieldMetadataItems', items: flatFields });

        applyChanges();

        const [viewsResult, navItemsResult] = await Promise.all([
          client.query({
            query: FindManyViewsDocument,
            variables: { objectMetadataId: createdObject.id },
            fetchPolicy: 'network-only',
          }),
          client.query({
            query: FindManyNavigationMenuItemsDocument,
            fetchPolicy: 'network-only',
          }),
        ]);

        const fetchedViews = viewsResult.data?.getViews ?? [];

        const {
          flatViews,
          flatViewFields,
          flatViewFilters,
          flatViewSorts,
          flatViewGroups,
          flatViewFilterGroups,
          flatViewFieldGroups,
        } = splitViewWithRelated(fetchedViews);

        addToDraft({ key: 'views', items: flatViews });
        addToDraft({ key: 'viewFields', items: flatViewFields });
        addToDraft({ key: 'viewFilters', items: flatViewFilters });
        addToDraft({ key: 'viewSorts', items: flatViewSorts });
        addToDraft({ key: 'viewGroups', items: flatViewGroups });
        addToDraft({ key: 'viewFilterGroups', items: flatViewFilterGroups });
        addToDraft({ key: 'viewFieldGroups', items: flatViewFieldGroups });

        replaceDraft(
          'navigationMenuItems',
          navItemsResult.data?.navigationMenuItems ?? [],
        );

        applyChanges();
      }

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
