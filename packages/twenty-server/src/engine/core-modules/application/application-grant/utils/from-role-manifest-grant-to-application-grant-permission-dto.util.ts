import { type RoleManifestGrant } from 'twenty-shared/application';

import { type ApplicationGrantPermissionDTO } from 'src/engine/core-modules/application/application-grant/dtos/application-grant.dto';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';

const ACTION_LABELS: Record<string, string> = {
  canReadObjectRecords: 'read',
  canUpdateObjectRecords: 'update',
  canSoftDeleteObjectRecords: 'delete',
  canDestroyObjectRecords: 'destroy',
};

export const fromRoleManifestGrantToApplicationGrantPermissionDto = ({
  grant,
  flatObjectMetadataMaps,
  flatPermissionFlagMaps,
}: {
  grant: RoleManifestGrant;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatPermissionFlagMaps'
>): ApplicationGrantPermissionDTO => {
  switch (grant.type) {
    case 'ALL_OBJECT_RECORDS':
      return {
        type: grant.type,
        action: grant.action,
        label: `${ACTION_LABELS[grant.action]} all objects`,
      };
    case 'ALL_SETTINGS':
      return { type: grant.type, label: 'all settings' };
    case 'ALL_TOOLS':
      return { type: grant.type, label: 'all tools' };
    case 'PERMISSION_FLAG': {
      const flatPermissionFlag =
        flatPermissionFlagMaps.byUniversalIdentifier[
          grant.permissionFlagUniversalIdentifier
        ];

      return {
        type: grant.type,
        permissionFlagUniversalIdentifier:
          grant.permissionFlagUniversalIdentifier,
        label:
          flatPermissionFlag?.label ?? grant.permissionFlagUniversalIdentifier,
      };
    }
    case 'OBJECT_RECORDS':
    case 'FIELD_VALUE':
    case 'ROW_LEVEL_RESTRICTION': {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[
          grant.objectUniversalIdentifier
        ];
      const action = 'action' in grant ? grant.action : null;

      return {
        type: grant.type,
        action,
        objectMetadataId: flatObjectMetadata?.id ?? null,
        label: `${action !== null ? (ACTION_LABELS[action] ?? action) : 'access'} ${flatObjectMetadata?.labelPlural ?? grant.objectUniversalIdentifier}`,
      };
    }
  }
};
