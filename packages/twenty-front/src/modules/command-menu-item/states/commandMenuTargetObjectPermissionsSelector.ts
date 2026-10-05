import { flatObjectMetadataItemsSelector } from '@/object-metadata/states/flatObjectMetadataItemsSelector';
import { objectPermissionsByObjectMetadataIdSelector } from '@/object-metadata/states/objectPermissionsByObjectMetadataIdSelector';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { type CommandMenuContextApi } from 'twenty-shared/types';

export const commandMenuTargetObjectPermissionsSelector = createAtomSelector<
  Pick<
    CommandMenuContextApi,
    'targetObjectReadPermissions' | 'targetObjectWritePermissions'
  >
>({
  key: 'commandMenuTargetObjectPermissionsSelector',
  areEqual: isDeeplyEqual,
  get: ({ get }) => {
    const objectPermissionsByObjectMetadataId = get(
      objectPermissionsByObjectMetadataIdSelector,
    );

    const targetObjectReadPermissions: Record<string, boolean> = {};
    const targetObjectWritePermissions: Record<string, boolean> = {};

    for (const objectMetadataItem of get(flatObjectMetadataItemsSelector)) {
      const objectPermissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        objectMetadataItem.id,
      );

      targetObjectReadPermissions[objectMetadataItem.nameSingular] =
        objectPermissions.canReadObjectRecords;
      targetObjectWritePermissions[objectMetadataItem.nameSingular] =
        objectPermissions.canUpdateObjectRecords;
    }

    return { targetObjectReadPermissions, targetObjectWritePermissions };
  },
});
