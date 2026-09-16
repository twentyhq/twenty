import {
  type ObjectPermissionManifest,
  type RoleManifest,
} from 'twenty-shared/application';

import { fromFlatRoleToRoleManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-role-to-role-manifest.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const ROLE_UID = '22222222-2222-4222-8222-222222222222';
const OBJECT_UID = '33333333-3333-4333-8333-333333333333';
const OBJECT_PERMISSION_UID = '44444444-4444-4444-8444-444444444444';
const PERMISSION_FLAG_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-14T10:00:00.000Z';

const ROLE_MANIFEST: RoleManifest = {
  universalIdentifier: ROLE_UID,
  label: 'Support',
  description: 'Handles tickets',
  icon: 'IconHeadset',
  canUpdateAllSettings: false,
  canAccessAllTools: true,
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: false,
  canSoftDeleteAllObjectRecords: false,
  canDestroyAllObjectRecords: false,
  canBeAssignedToUsers: true,
  canBeAssignedToAgents: false,
  canBeAssignedToApiKeys: true,
};

const OBJECT_PERMISSION_MANIFEST: ObjectPermissionManifest = {
  universalIdentifier: OBJECT_PERMISSION_UID,
  objectUniversalIdentifier: OBJECT_UID,
  canReadObjectRecords: true,
};

const forward = (roleManifest: RoleManifest) =>
  fromRoleManifestToUniversalFlatRole({
    roleManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatRoleToRoleManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatRoleToRoleManifest({ flatRole: forward(ROLE_MANIFEST) }),
    ).toEqual(ROLE_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatRole: UniversalFlatRole = {
      ...forward(ROLE_MANIFEST),
      description: null,
      icon: null,
      canUpdateAllSettings: true,
      canBeAssignedToAgents: true,
      canBeAssignedToApiKeys: false,
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatRole,
        toUniversalFlatEntity: forward(
          fromFlatRoleToRoleManifest({ flatRole }),
        ),
        metadataName: 'role',
      }),
    ).toBeUndefined();
  });

  it('should omit the description and icon of a role stored without them', () => {
    const {
      description: _description,
      icon: _icon,
      ...manifestWithoutDescriptionAndIcon
    } = ROLE_MANIFEST;

    expect(
      fromFlatRoleToRoleManifest({
        flatRole: forward(manifestWithoutDescriptionAndIcon),
      }),
    ).toStrictEqual(manifestWithoutDescriptionAndIcon);
  });

  it('should nest its permissions and omit the empty collections', () => {
    expect(
      fromFlatRoleToRoleManifest({
        flatRole: forward(ROLE_MANIFEST),
        children: {
          objectPermissions: [OBJECT_PERMISSION_MANIFEST],
          fieldPermissions: [],
          permissionFlagUniversalIdentifiers: [PERMISSION_FLAG_UID],
        },
      }),
    ).toStrictEqual({
      ...ROLE_MANIFEST,
      objectPermissions: [OBJECT_PERMISSION_MANIFEST],
      permissionFlagUniversalIdentifiers: [PERMISSION_FLAG_UID],
    });
  });
});
