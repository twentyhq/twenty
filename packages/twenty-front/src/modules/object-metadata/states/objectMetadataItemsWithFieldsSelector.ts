import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { fieldMetadataItemsCurrentSelector } from '@/metadata-store/states/fieldMetadataItemsCurrentSelector';
import { indexMetadataItemsCurrentSelector } from '@/metadata-store/states/indexMetadataItemsCurrentSelector';
import { objectMetadataItemsCurrentSelector } from '@/metadata-store/states/objectMetadataItemsCurrentSelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getNonReadableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonReadableFieldMetadataIdsFromObjectPermissions';
import { getNonUpdatableFieldMetadataIdsFromObjectPermissions } from '@/object-metadata/utils/getNonUpdatableFieldMetadataIdsFromObjectPermissions';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const objectMetadataItemsWithFieldsSelector =
  createAtomSelector<ObjectMetadataItem[]>({
    key: 'objectMetadataItemsWithFieldsSelector',
    get: ({ get }) => {
      const flatObjects = get(objectMetadataItemsCurrentSelector);
      const allFlatFields = get(fieldMetadataItemsCurrentSelector);
      const allFlatIndexes = get(indexMetadataItemsCurrentSelector);
      const currentUserWorkspace = get(currentUserWorkspaceState);

      const fieldsByObjectId = new Map<
        string,
        (typeof allFlatFields)[number][]
      >();

      for (const field of allFlatFields) {
        const existing = fieldsByObjectId.get(field.objectMetadataId);

        if (isDefined(existing)) {
          existing.push(field);
        } else {
          fieldsByObjectId.set(field.objectMetadataId, [field]);
        }
      }

      const indexesByObjectId = new Map<
        string,
        (typeof allFlatIndexes)[number][]
      >();

      for (const index of allFlatIndexes) {
        const existing = indexesByObjectId.get(index.objectMetadataId);

        if (isDefined(existing)) {
          existing.push(index);
        } else {
          indexesByObjectId.set(index.objectMetadataId, [index]);
        }
      }

      const objectPermissionsByObjectMetadataId =
        currentUserWorkspace?.objectsPermissions.reduce(
          (accumulator, objectPermission) => {
            accumulator[objectPermission.objectMetadataId] = objectPermission;

            return accumulator;
          },
          {} as Record<
            string,
            ObjectPermissions & { objectMetadataId: string }
          >,
        ) ?? {};

      return flatObjects.map((flatObject) => {
        const fields = fieldsByObjectId.get(flatObject.id) ?? [];
        const indexMetadatas = indexesByObjectId.get(flatObject.id) ?? [];

        const objectPermissions =
          getObjectPermissionsFromMapByObjectMetadataId({
            objectPermissionsByObjectMetadataId,
            objectMetadataId: flatObject.id,
          });

        const nonReadableFieldMetadataIds =
          getNonReadableFieldMetadataIdsFromObjectPermissions({
            objectPermissions,
          });

        const nonUpdatableFieldMetadataIds =
          getNonUpdatableFieldMetadataIdsFromObjectPermissions({
            objectPermissions,
          });

        return {
          ...flatObject,
          fields,
          indexMetadatas,
          readableFields: fields.filter(
            (field) => !nonReadableFieldMetadataIds.includes(field.id),
          ),
          updatableFields: fields.filter(
            (field) => !nonUpdatableFieldMetadataIds.includes(field.id),
          ),
        } satisfies ObjectMetadataItem;
      });
    },
  });
