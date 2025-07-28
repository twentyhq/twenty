import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getFilterFilterableFieldMetadataItems } from '@/object-metadata/utils/getFilterFilterableFieldMetadataItems';
import { getReadRestrictedFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getReadRestrictedFieldMetadataIdsFromObjectPermissions';
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

        const isFieldsPermissionsEnabled =
          checkIfFeatureFlagIsEnabledOnWorkspace(
            FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED,
            currentWorkspace,
          );

        const filterFilterableFieldMetadataItems =
          getFilterFilterableFieldMetadataItems({
            isJsonFilterEnabled: isJsonFeatureFlagEnabled,
          });

        let restrictedFieldMetadataIds: string[] = [];

        if (isFieldsPermissionsEnabled) {
          const currentUserWorkspace = get(currentUserWorkspaceState);

          restrictedFieldMetadataIds =
            getReadRestrictedFieldMetadataIdsFromObjectPermissions({
              objectPermissions: currentUserWorkspace?.objectPermissions,
              objectMetadataId: objectMetadataItem.id,
            });
        }

        const availableFieldMetadataItemsForFilter = objectMetadataItem.fields
          .filter(filterFilterableFieldMetadataItems)
          .filter((field) => {
            return !restrictedFieldMetadataIds.includes(field.id);
          });
        return availableFieldMetadataItemsForFilter;
      },
  });
