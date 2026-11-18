import { type Manifest } from 'twenty-shared/application';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { freezeStandaloneApplicationRolesThroughMutation } from 'src/engine/core-modules/application/application-manifest/utils/freeze-standalone-application-roles-through-mutation.util';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatFieldPermission } from 'src/engine/metadata-modules/flat-field-permission/types/flat-field-permission.type';
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';

const APPLICATION_ID = 'application-id';
const REQUESTED_ROLE = 'requested-role';
const MEMBER_ROLE = 'member-role';

const buildRole = (universalIdentifier: string) =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    applicationId: APPLICATION_ID,
    label: universalIdentifier,
  }) as FlatRole;

const buildObjectPermission = (roleUniversalIdentifier: string) =>
  ({
    id: `${roleUniversalIdentifier}-object-permission-id`,
    universalIdentifier: `${roleUniversalIdentifier}-object-permission`,
    applicationId: APPLICATION_ID,
    roleId: `${roleUniversalIdentifier}-id`,
    roleUniversalIdentifier,
  }) as FlatObjectPermission;

const buildFieldPermission = (roleUniversalIdentifier: string) =>
  ({
    id: `${roleUniversalIdentifier}-field-permission-id`,
    universalIdentifier: `${roleUniversalIdentifier}-field-permission`,
    applicationId: APPLICATION_ID,
    roleId: `${roleUniversalIdentifier}-id`,
    roleUniversalIdentifier,
  }) as FlatFieldPermission;

const buildInstalledMaps = ({
  roleUniversalIdentifiers,
  agentRoleUniversalIdentifier,
}: {
  roleUniversalIdentifiers: string[];
  agentRoleUniversalIdentifier?: string;
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  maps.flatRoleMaps = addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: roleUniversalIdentifiers.map(buildRole),
    flatEntityMaps: maps.flatRoleMaps,
  });
  maps.flatObjectPermissionMaps = addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: roleUniversalIdentifiers.map(buildObjectPermission),
    flatEntityMaps: maps.flatObjectPermissionMaps,
  });
  maps.flatFieldPermissionMaps = addAllFlatEntitiesToFlatEntityMaps({
    flatEntities: roleUniversalIdentifiers.map(buildFieldPermission),
    flatEntityMaps: maps.flatFieldPermissionMaps,
  });

  if (agentRoleUniversalIdentifier !== undefined) {
    maps.flatRoleTargetMaps = addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: [
        {
          id: 'agent-role-target-id',
          universalIdentifier: 'agent-role-target',
          applicationId: APPLICATION_ID,
          agentId: 'agent-id',
          roleId: `${agentRoleUniversalIdentifier}-id`,
          roleUniversalIdentifier: agentRoleUniversalIdentifier,
        } as FlatRoleTarget,
      ],
      flatEntityMaps: maps.flatRoleTargetMaps,
    });
  }

  return maps;
};

const buildDesiredMaps = (
  roleUniversalIdentifiers: string[],
): AllUniversalFlatEntityMaps => {
  const maps = buildInstalledMaps({ roleUniversalIdentifiers });

  return maps as unknown as AllUniversalFlatEntityMaps;
};

const buildManifest = ({
  roleUniversalIdentifiers,
  agentRoleUniversalIdentifier,
}: {
  roleUniversalIdentifiers: string[];
  agentRoleUniversalIdentifier?: string;
}) =>
  ({
    application: {
      universalIdentifier: 'application',
      defaultRoleUniversalIdentifier: REQUESTED_ROLE,
    },
    roles: roleUniversalIdentifiers.map((universalIdentifier) => ({
      universalIdentifier,
      label: universalIdentifier,
    })),
    agents:
      agentRoleUniversalIdentifier === undefined
        ? []
        : [{ roleUniversalIdentifier: agentRoleUniversalIdentifier }],
  }) as unknown as Pick<Manifest, 'application' | 'roles' | 'agents'>;

const getRoleUniversalIdentifiers = (
  maps: AllFlatEntityMaps | AllUniversalFlatEntityMaps,
) => ({
  roles: Object.keys(maps.flatRoleMaps.byUniversalIdentifier),
  objectPermissions: Object.keys(
    maps.flatObjectPermissionMaps.byUniversalIdentifier,
  ),
  fieldPermissions: Object.keys(
    maps.flatFieldPermissionMaps.byUniversalIdentifier,
  ),
});

const freeze = ({
  manifest,
  from,
  to,
  requestedRoleId = `${REQUESTED_ROLE}-id`,
}: {
  manifest: ReturnType<typeof buildManifest>;
  from: AllFlatEntityMaps;
  to: AllUniversalFlatEntityMaps;
  requestedRoleId?: string | null;
}) =>
  freezeStandaloneApplicationRolesThroughMutation({
    manifest,
    ownerFlatApplication: { requestedRoleId },
    fromAllFlatEntityMapsToMutate: from,
    toAllUniversalFlatEntityMapsToMutate: to,
  });

const ONLY_REQUESTED_ROLE = {
  roles: [REQUESTED_ROLE],
  objectPermissions: [`${REQUESTED_ROLE}-object-permission`],
  fieldPermissions: [`${REQUESTED_ROLE}-field-permission`],
};

describe('freezeStandaloneApplicationRolesThroughMutation', () => {
  it('should keep an installed standalone role out of the diff when the manifest changes it', () => {
    const from = buildInstalledMaps({
      roleUniversalIdentifiers: [REQUESTED_ROLE, MEMBER_ROLE],
    });
    const to = buildDesiredMaps([REQUESTED_ROLE, MEMBER_ROLE]);

    freeze({
      manifest: buildManifest({
        roleUniversalIdentifiers: [REQUESTED_ROLE, MEMBER_ROLE],
      }),
      from,
      to,
    });

    expect(getRoleUniversalIdentifiers(from)).toEqual(ONLY_REQUESTED_ROLE);
    expect(getRoleUniversalIdentifiers(to)).toEqual(ONLY_REQUESTED_ROLE);
  });

  it('should keep an installed standalone role out of the diff when the manifest drops it', () => {
    const from = buildInstalledMaps({
      roleUniversalIdentifiers: [REQUESTED_ROLE, MEMBER_ROLE],
    });
    const to = buildDesiredMaps([REQUESTED_ROLE]);

    freeze({
      manifest: buildManifest({ roleUniversalIdentifiers: [REQUESTED_ROLE] }),
      from,
      to,
    });

    expect(getRoleUniversalIdentifiers(from)).toEqual(ONLY_REQUESTED_ROLE);
  });

  it('should not create a new standalone role', () => {
    const from = buildInstalledMaps({
      roleUniversalIdentifiers: [REQUESTED_ROLE],
    });
    const to = buildDesiredMaps([REQUESTED_ROLE, MEMBER_ROLE]);

    freeze({
      manifest: buildManifest({
        roleUniversalIdentifiers: [REQUESTED_ROLE, MEMBER_ROLE],
      }),
      from,
      to,
    });

    expect(getRoleUniversalIdentifiers(to)).toEqual(ONLY_REQUESTED_ROLE);
  });

  it('should leave the requested and agent roles in the diff', () => {
    const roleUniversalIdentifiers = [REQUESTED_ROLE, 'agent-role'];
    const from = buildInstalledMaps({ roleUniversalIdentifiers });
    const to = buildDesiredMaps(roleUniversalIdentifiers);

    freeze({
      manifest: buildManifest({
        roleUniversalIdentifiers,
        agentRoleUniversalIdentifier: 'agent-role',
      }),
      from,
      to,
    });

    expect(getRoleUniversalIdentifiers(from).roles).toEqual(
      roleUniversalIdentifiers,
    );
    expect(getRoleUniversalIdentifiers(to).roles).toEqual(
      roleUniversalIdentifiers,
    );
  });

  it('should let the sync delete a dropped role that was the requested role or an agent role', () => {
    const from = buildInstalledMaps({
      roleUniversalIdentifiers: ['old-requested-role', 'old-agent-role'],
      agentRoleUniversalIdentifier: 'old-agent-role',
    });
    const to = buildDesiredMaps([REQUESTED_ROLE]);

    freeze({
      manifest: buildManifest({ roleUniversalIdentifiers: [REQUESTED_ROLE] }),
      from,
      to,
      requestedRoleId: 'old-requested-role-id',
    });

    expect(getRoleUniversalIdentifiers(from).roles).toEqual([
      'old-requested-role',
      'old-agent-role',
    ]);
    expect(Object.keys(from.flatRoleTargetMaps.byUniversalIdentifier)).toEqual([
      'agent-role-target',
    ]);
  });
});
