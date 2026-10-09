import { v4 } from 'uuid';
import { isDefined, isMorphRelationGroup } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

export const buildMorphPermissionReferenceUpdates = ({
  flatFieldMetadataMaps,
  flatFieldPermissionMaps,
  fields,
  replacementByFieldId,
  direction,
}: Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatFieldPermissionMaps'
> & {
  fields: FlatFieldMetadata[];
  replacementByFieldId: Map<string, FlatFieldMetadata>;
  direction: 'up' | 'down';
}): NonNullable<AllFlatEntityOperationByMetadataName['fieldPermission']> => {
  const operations: NonNullable<
    AllFlatEntityOperationByMetadataName['fieldPermission']
  > = {
    flatEntityToCreate: [],
    flatEntityToUpdate: [],
    flatEntityToDelete: [],
  };

  const permissionsByRoleAndField = new Map<
    string,
    (typeof operations.flatEntityToUpdate)[number]
  >();
  const createdPermissionIdentifiers = new Set<string>();
  const permissions = Object.values(
    flatFieldPermissionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .flatMap((permission) => {
      const group =
        flatFieldMetadataMaps.byUniversalIdentifier[
          permission.fieldMetadataUniversalIdentifier
        ];
      if (
        direction !== 'down' ||
        !isDefined(group) ||
        !isMorphRelationGroup(group)
      )
        return [permission];
      const representative = replacementByFieldId.get(group.id);
      return fields
        .filter(
          (field) => field.morphId === group.morphId && field.id !== group.id,
        )
        .map((target) => {
          const universalIdentifier =
            target.id === representative?.id
              ? permission.universalIdentifier
              : v4();
          if (universalIdentifier !== permission.universalIdentifier)
            createdPermissionIdentifiers.add(universalIdentifier);
          return {
            ...permission,
            id:
              universalIdentifier === permission.universalIdentifier
                ? permission.id
                : v4(),
            universalIdentifier,
            fieldMetadataId: target.id,
            fieldMetadataUniversalIdentifier: target.universalIdentifier,
          };
        });
    });
  for (const permission of permissions) {
    const replacement = replacementByFieldId.get(permission.fieldMetadataId);
    const fieldUniversalIdentifier =
      replacement?.universalIdentifier ??
      permission.fieldMetadataUniversalIdentifier;
    const key = `${permission.roleId}:${fieldUniversalIdentifier}`;
    const existing = permissionsByRoleAndField.get(key);
    if (isDefined(existing)) {
      const retainExisting =
        !createdPermissionIdentifiers.has(existing.universalIdentifier) ||
        createdPermissionIdentifiers.has(permission.universalIdentifier);
      const retained = retainExisting ? existing : permission;
      const discarded = retainExisting ? permission : existing;
      permissionsByRoleAndField.set(key, {
        ...retained,
        fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
        canReadFieldValue:
          existing.canReadFieldValue === false ||
          permission.canReadFieldValue === false
            ? false
            : null,
        canUpdateFieldValue:
          existing.canUpdateFieldValue === false ||
          permission.canUpdateFieldValue === false
            ? false
            : null,
      });
      if (!createdPermissionIdentifiers.has(discarded.universalIdentifier))
        operations.flatEntityToDelete.push(discarded);
    } else {
      permissionsByRoleAndField.set(key, {
        ...permission,
        fieldMetadataUniversalIdentifier: fieldUniversalIdentifier,
      });
    }
  }
  for (const permission of permissionsByRoleAndField.values()) {
    if (createdPermissionIdentifiers.has(permission.universalIdentifier)) {
      operations.flatEntityToCreate.push(permission);
      continue;
    }
    const previous =
      flatFieldPermissionMaps.byUniversalIdentifier[
        permission.universalIdentifier
      ];
    if (
      previous?.fieldMetadataUniversalIdentifier !==
        permission.fieldMetadataUniversalIdentifier ||
      previous?.canReadFieldValue !== permission.canReadFieldValue ||
      previous?.canUpdateFieldValue !== permission.canUpdateFieldValue
    )
      operations.flatEntityToUpdate.push(permission);
  }

  return operations;
};
