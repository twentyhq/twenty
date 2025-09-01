import { useMutation } from '@apollo/client';

import {
  type CreateObjectInput,
  type CreateOneObjectMetadataItemMutation,
  type CreateOneObjectMetadataItemMutationVariables,
} from '~/generated-metadata/graphql';

import { CREATE_ONE_OBJECT_METADATA_ITEM } from '../graphql/mutations';

import { useRefreshObjectMetadataItems } from '@/object-metadata/hooks/useRefreshObjectMetadataItems';
import { useRefreshCoreViews } from '@/views/hooks/useRefreshCoreViews';
import { useRefreshCachedViews } from '@/views/hooks/useRefreshViews';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { FeatureFlagKey } from '~/generated/graphql';

export const useCreateOneObjectMetadataItem = () => {
  const featureFlagMap = useFeatureFlagsMap();
  const isCoreViewEnabled = featureFlagMap[FeatureFlagKey.IS_CORE_VIEW_ENABLED];
  const { refreshCachedViews } = useRefreshCachedViews();
  const { refreshObjectMetadataItems } =
    useRefreshObjectMetadataItems('network-only');
  const { refreshCoreViews } = useRefreshCoreViews();

  const [mutate] = useMutation<
    CreateOneObjectMetadataItemMutation,
    CreateOneObjectMetadataItemMutationVariables
  >(CREATE_ONE_OBJECT_METADATA_ITEM);

  const createOneObjectMetadataItem = async (input: CreateObjectInput) => {
    const createdObjectMetadata = await mutate({
      variables: {
        input: { object: input },
      },
    });

    await refreshObjectMetadataItems();
    await refreshCachedViews();
    if (
      isCoreViewEnabled &&
      createdObjectMetadata.data?.createOneObject?.id !== undefined
    ) {
      await refreshCoreViews(createdObjectMetadata.data.createOneObject.id);
    }
    return createdObjectMetadata;
  };

  return {
    createOneObjectMetadataItem,
  };
};
