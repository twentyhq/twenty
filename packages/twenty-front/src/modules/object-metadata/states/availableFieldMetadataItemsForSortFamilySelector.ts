import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { getReadRestrictedFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getReadRestrictedFieldMetadataIdsFromObjectPermissions';
import { selectorFamily } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const availableFieldMetadataItemsForSortFamilySelector = selectorFamily({
  key: 'availableFieldMetadataItemsForSortFamilySelector',
  get:
    ({ objectMetadataItemId }: { objectMetadataItemId: string }) =>
    ({ get }) => {
      const objectMetadataItems = get(objectMetadataItemsState);

      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === objectMetadataItemId,
      );

      if (!isDefined(objectMetadataItem)) {
        return [];
      }

      const currentWorkspace = get(currentWorkspaceState);

      let restrictedFieldMetadataIds: string[] = [];
      const currentUserWorkspace = get(currentUserWorkspaceState);

      restrictedFieldMetadataIds =
        getReadRestrictedFieldMetadataIdsFromObjectPermissions({
          objectPermissions: currentUserWorkspace?.objectPermissions,
          objectMetadataId: objectMetadataItem.id,
        });

      const availableFieldMetadataItemsForSort = objectMetadataItem.fields
        .filter(filterSortableFieldMetadataItems)
        .filter((field) => {
          return !restrictedFieldMetadataIds.includes(field.id);
        });

      return availableFieldMetadataItemsForSort;
    },
});
