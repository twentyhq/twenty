import { type RoleManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { getDefaultRoleGrantsAddedByManifest } from 'src/engine/core-modules/application/application-manifest/utils/get-default-role-grants-added-by-manifest.util';

const DEFAULT_ROLE_UID = '40000000-0000-4000-8000-000000000001';
const OTHER_ROLE_UID = '40000000-0000-4000-8000-000000000002';
const PET_UID = '20000000-0000-4000-8000-000000000001';
const EXPORT_PETS_FLAG_UID = '50000000-0000-4000-8000-000000000001';

const installedDefaultRole: RoleManifest = {
  universalIdentifier: DEFAULT_ROLE_UID,
  label: 'App role',
  canReadAllObjectRecords: true,
  objectPermissions: [
    { objectUniversalIdentifier: PET_UID, canUpdateObjectRecords: true },
  ],
};

const buildManifest = ({
  defaultRole,
  permissionFlags = [],
}: {
  defaultRole: RoleManifest;
  permissionFlags?: {
    universalIdentifier: string;
    permissionType?: 'tool' | 'settings';
  }[];
}) => ({
  application: {
    universalIdentifier: '10000000-0000-4000-8000-000000000001',
    displayName: 'Pets',
    description: '',
    defaultRoleUniversalIdentifier: DEFAULT_ROLE_UID,
    packageJsonChecksum: '',
    yarnLockChecksum: '',
  },
  roles: [
    {
      universalIdentifier: OTHER_ROLE_UID,
      label: 'Other',
      canAccessAllTools: true,
    },
    defaultRole,
  ],
  permissionFlags: permissionFlags.map((flag) => ({
    ...flag,
    key: flag.universalIdentifier,
    label: flag.universalIdentifier,
  })),
});

describe('getDefaultRoleGrantsAddedByManifest', () => {
  it('returns nothing when the target default role grants no more than the installed one', () => {
    expect(
      getDefaultRoleGrantsAddedByManifest({
        installedDefaultRole,
        manifest: buildManifest({
          defaultRole: {
            ...installedDefaultRole,
            objectPermissions: [
              {
                objectUniversalIdentifier: PET_UID,
                canReadObjectRecords: true,
              },
            ],
          },
        }),
      }),
    ).toEqual([]);
  });

  it('reports every grant the target default role adds', () => {
    expect(
      getDefaultRoleGrantsAddedByManifest({
        installedDefaultRole,
        manifest: buildManifest({
          defaultRole: {
            ...installedDefaultRole,
            canUpdateAllObjectRecords: true,
            permissionFlagUniversalIdentifiers: [
              SystemPermissionFlag.SEND_EMAIL_TOOL,
            ],
          },
        }),
      }),
    ).toEqual([
      { type: 'ALL_OBJECT_RECORDS', action: 'canUpdateObjectRecords' },
      {
        type: 'PERMISSION_FLAG',
        permissionFlagUniversalIdentifier: SystemPermissionFlag.SEND_EMAIL_TOOL,
      },
    ]);
  });

  it('treats a custom flag without a permission type as a tool flag covered by access to all tools', () => {
    expect(
      getDefaultRoleGrantsAddedByManifest({
        installedDefaultRole: {
          ...installedDefaultRole,
          canAccessAllTools: true,
        },
        manifest: buildManifest({
          defaultRole: {
            ...installedDefaultRole,
            permissionFlagUniversalIdentifiers: [EXPORT_PETS_FLAG_UID],
          },
          permissionFlags: [{ universalIdentifier: EXPORT_PETS_FLAG_UID }],
        }),
      }),
    ).toEqual([]);
  });

  it('ignores the other roles of the manifest', () => {
    expect(
      getDefaultRoleGrantsAddedByManifest({
        installedDefaultRole,
        manifest: buildManifest({ defaultRole: installedDefaultRole }),
      }),
    ).toEqual([]);
  });

  it('returns nothing when the manifest declares no role matching its default role', () => {
    const manifest = buildManifest({ defaultRole: installedDefaultRole });

    expect(
      getDefaultRoleGrantsAddedByManifest({
        installedDefaultRole,
        manifest: {
          ...manifest,
          roles: manifest.roles.filter(
            ({ universalIdentifier }) =>
              universalIdentifier !== DEFAULT_ROLE_UID,
          ),
        },
      }),
    ).toEqual([]);
  });
});
