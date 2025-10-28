import { useMutation } from '@apollo/client';

import {
  type UpdateOneFieldMetadataItemMutation,
  type UpdateOneFieldMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { UPDATE_ONE_FIELD_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViewsByObjectMetadataId } from '@/views/hooks/useRefreshCoreViewsByObjectMetadataId';

export const useUpdateOneFieldMetadataItem = () => {
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');

  const { refreshCoreViewsByObjectMetadataId } =
    useRefreshCoreViewsByObjectMetadataId();

  const [mutate] = useMutation<
    UpdateOneFieldMetadataItemMutation,
    UpdateOneFieldMetadataItemMutationVariables
  >(UPDATE_ONE_FIELD_METADATA_ITEM);

  const updateOneFieldMetadataItem = async ({
    objectMetadataId,
    fieldMetadataIdToUpdate,
    updatePayload,
  }: {
    objectMetadataId: string;
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
      | 'isLabelSyncedWithName'
    >;
  }) => {
    const result = await mutate({
      variables: {
        idToUpdate: fieldMetadataIdToUpdate,
        updatePayload: updatePayload,
      },
    });

    await refreshObjectMetadataItems();
    await refreshCoreViewsByObjectMetadataId(objectMetadataId);

    return result;
  };

  return {
    updateOneFieldMetadataItem,
  };
};
