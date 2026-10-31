import { type RoleManifest } from 'twenty-shared/application';

import {
  addRoleManifestGrants,
  removeRoleManifestGrants,
} from 'src/engine/core-modules/application/application-grant/utils/apply-role-manifest-grants.util';
import { buildInitialGrantRoleManifest } from 'src/engine/core-modules/application/application-grant/utils/build-initial-grant-role-manifest.util';
import { computeGrantMissingLockedPermissions } from 'src/engine/core-modules/application/application-grant/utils/compute-grant-locked-requirement.util';
import {
  computeGrantNarrowedPermissions,
  computeGrantPendingPermissions,
} from 'src/engine/core-modules/application/application-grant/utils/compute-grant-pending-permissions.util';

const COMPANY = 'company-universal-identifier';
const PERSON = 'person-universal-identifier';
const PET = 'pet-universal-identifier';
const OWN_OBJECT = 'own-object-universal-identifier';

const ALL_ACTIONS = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
};

const buildRequest = (overrides: Partial<RoleManifest> = {}): RoleManifest => ({
  universalIdentifier: 'requested-role',
  label: 'Requested role',
  canReadAllObjectRecords: true,
  objectPermissions: [
    { objectUniversalIdentifier: COMPANY, canReadObjectRecords: true },
    { objectUniversalIdentifier: OWN_OBJECT, ...ALL_ACTIONS },
  ],
  permissionFlagUniversalIdentifiers: ['upload-file-flag'],
  ...overrides,
});

describe('application grant role manifest', () => {
  it('keeps the "all objects" switch when the admin picks all objects', () => {
    const grant = buildInitialGrantRoleManifest({
      requestedRoleManifest: buildRequest(),
      objectScopes: [
        { action: 'canReadObjectRecords', objectUniversalIdentifiers: null },
      ],
    });

    expect(grant.canReadAllObjectRecords).toBe(true);
    expect(grant.permissionFlagUniversalIdentifiers).toEqual([
      'upload-file-flag',
    ]);
  });

  it('narrows the "all objects" switch to the picked objects and keeps required rows', () => {
    const grant = buildInitialGrantRoleManifest({
      requestedRoleManifest: buildRequest(),
      objectScopes: [
        { action: 'canReadObjectRecords', objectUniversalIdentifiers: [PERSON] },
      ],
    });

    expect(grant.canReadAllObjectRecords).toBe(false);
    expect(
      grant.objectPermissions?.map(
        ({ objectUniversalIdentifier, canReadObjectRecords }) => [
          objectUniversalIdentifier,
          canReadObjectRecords,
        ],
      ),
    ).toEqual([
      [COMPANY, true],
      [OWN_OBJECT, true],
      [PERSON, true],
    ]);
    expect(
      computeGrantMissingLockedPermissions({
        approvedRoleManifest: buildRequest(),
        grantRoleManifest: grant,
      }),
    ).toEqual([]);
  });

  it('rejects a grant that drops a required row', () => {
    const grant = buildInitialGrantRoleManifest({
      requestedRoleManifest: buildRequest(),
      objectScopes: [],
    });

    expect(
      computeGrantMissingLockedPermissions({
        approvedRoleManifest: buildRequest(),
        grantRoleManifest: {
          ...grant,
          objectPermissions: grant.objectPermissions?.filter(
            (objectPermission) =>
              objectPermission.objectUniversalIdentifier !== OWN_OBJECT,
          ),
        },
      }),
    ).toContainEqual({
      type: 'OBJECT_RECORDS',
      objectUniversalIdentifier: OWN_OBJECT,
      action: 'canDestroyObjectRecords',
    });
  });

  it('reports as pending only what neither the approval nor the admin covers', () => {
    const approvedRoleManifest = buildRequest();
    const grantRoleManifest = addRoleManifestGrants({
      roleManifest: buildInitialGrantRoleManifest({
        requestedRoleManifest: approvedRoleManifest,
        objectScopes: [],
      }),
      grants: [
        {
          type: 'OBJECT_RECORDS',
          objectUniversalIdentifier: PET,
          action: 'canUpdateObjectRecords',
        },
      ],
    });
    const requestedRoleManifest = buildRequest({
      objectPermissions: [
        {
          objectUniversalIdentifier: COMPANY,
          canReadObjectRecords: true,
          canUpdateObjectRecords: true,
        },
        { objectUniversalIdentifier: PET, canUpdateObjectRecords: true },
        { objectUniversalIdentifier: OWN_OBJECT, ...ALL_ACTIONS },
      ],
    });

    expect(
      computeGrantPendingPermissions({
        requestedRoleManifest,
        approvedRoleManifest,
        grantRoleManifest,
      }),
    ).toEqual([
      {
        type: 'OBJECT_RECORDS',
        objectUniversalIdentifier: COMPANY,
        action: 'canUpdateObjectRecords',
      },
    ]);
  });

  it('removes what a narrower request drops and keeps admin additions', () => {
    const approvedRoleManifest = buildRequest();
    const grantRoleManifest = addRoleManifestGrants({
      roleManifest: buildInitialGrantRoleManifest({
        requestedRoleManifest: approvedRoleManifest,
        objectScopes: [],
      }),
      grants: [
        {
          type: 'OBJECT_RECORDS',
          objectUniversalIdentifier: PET,
          action: 'canReadObjectRecords',
        },
      ],
    });
    const requestedRoleManifest = buildRequest({
      canReadAllObjectRecords: false,
      permissionFlagUniversalIdentifiers: [],
    });

    const narrowedPermissions = computeGrantNarrowedPermissions({
      requestedRoleManifest,
      approvedRoleManifest,
    });

    expect(narrowedPermissions).toEqual(
      expect.arrayContaining([
        { type: 'ALL_OBJECT_RECORDS', action: 'canReadObjectRecords' },
        {
          type: 'PERMISSION_FLAG',
          permissionFlagUniversalIdentifier: 'upload-file-flag',
        },
      ]),
    );

    const narrowedGrant = removeRoleManifestGrants({
      roleManifest: grantRoleManifest,
      grants: narrowedPermissions,
    });

    expect(narrowedGrant.canReadAllObjectRecords).toBe(false);
    expect(narrowedGrant.permissionFlagUniversalIdentifiers).toEqual([]);
    expect(
      narrowedGrant.objectPermissions?.find(
        (objectPermission) => objectPermission.objectUniversalIdentifier === PET,
      )?.canReadObjectRecords,
    ).toBe(true);
  });
});
