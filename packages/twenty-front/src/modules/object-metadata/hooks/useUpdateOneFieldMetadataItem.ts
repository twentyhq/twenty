import { useMutation } from '@apollo/client';

import {
  FieldMetadataType,
  UpdateOneFieldMetadataItemMutation,
  UpdateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useApolloMetadataClient } from './useApolloMetadataClient';

export const useUpdateOneFieldMetadataItem = () => {
  const apolloMetadataClient = useApolloMetadataClient();

  const [mutate] = useMutation<
    UpdateOneFieldMetadataItemMutation,
    UpdateOneFieldMetadataItemMutationVariables
  >(UPDATE_ONE_FIELD_METADATA_ITEM, {
    client: apolloMetadataClient ?? undefined,
  });

  const updateOneFieldMetadataItem = async ({
    fieldMetadataIdToUpdate,
    updatePayload,
  }: {
    fieldMetadataIdToUpdate: UpdateOneFieldMetadataItemMutationVariables['idToUpdate'];
    updatePayload: Pick<
      UpdateOneFieldMetadataItemMutationVariables['updatePayload'],
      | 'description'
      | 'icon'
      | 'isActive'
      | 'label'
      | 'name'
      | 'defaultValue'
      | 'options'
    >;
  }) => {
    return await mutate({
      variables: {
        idToUpdate: fieldMetadataIdToUpdate,
        updatePayload: {
          ...updatePayload,
          label: updatePayload.label ?? undefined,
        },
      },
      optimisticResponse: {
        updateOneField: {
          id: fieldMetadataIdToUpdate,
          updatedAt: new Date().toISOString(),
          __typename: 'field',
          createdAt: undefined,
          type: '' as FieldMetadataType,
          ...updatePayload,
        } as UpdateOneFieldMetadataItemMutation['updateOneField'],
      },
    });
  };

  return {
    updateOneFieldMetadataItem,
  };
};
