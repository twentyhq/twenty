import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const availableFieldMetadataItemsForFilterFamilySelector =
  selectorFamily({
    key: 'availableFieldMetadataItemsForFilterFamilySelector',
    get:
      ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
      ({ get }) => {
        const currentWorkspace = get(currentWorkspaceState);
        const objectMetadataItems = get(objectMetadataItemsState);

        const objectMetadataItem = objectMetadataItems.find(
          (item) => item.id === objectMetadataItemId,
        );
        if (!isDefined(objectMetadataItem)) {
          return [];
        }

        const isJsonFeatureFlagEnabled = checkIfFeatureFlagIsEnabledOnWorkspace(
          FeatureFlagKey.IS_JSON_FILTER_ENABLED,
          currentWorkspace,
        );

        const filterFilterableFieldMetadataItems =
          getFilterFilterableFieldMetadataItems({
            isJsonFilterEnabled: isJsonFeatureFlagEnabled,
          });

        const availableFieldMetadataItemsForFilter =
          objectMetadataItem.readableFields.filter(
            filterFilterableFieldMetadataItems,
          );
        return availableFieldMetadataItemsForFilter;
      },
  });
