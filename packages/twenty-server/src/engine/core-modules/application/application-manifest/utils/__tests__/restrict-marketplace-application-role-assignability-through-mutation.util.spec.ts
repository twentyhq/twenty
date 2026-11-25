import { type Manifest } from 'twenty-shared/application';

import { restrictMarketplaceApplicationRoleAssignabilityThroughMutation } from 'src/engine/core-modules/application/application-manifest/utils/restrict-marketplace-application-role-assignability-through-mutation.util';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { type UniversalFlatRole } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-role.type';

const ASSIGNABLE_EVERYWHERE = {
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToAgents: true,
};

const buildFlatRoleMaps = (
  roleUniversalIdentifiers: string[],
): Pick<AllUniversalFlatEntityMaps, 'flatRoleMaps'> => ({
  flatRoleMaps: {
    byUniversalIdentifier: Object.fromEntries(
      roleUniversalIdentifiers.map((universalIdentifier) => [
        universalIdentifier,
        { universalIdentifier, ...ASSIGNABLE_EVERYWHERE } as UniversalFlatRole,
      ]),
    ),
  },
});

const restrict = (maps: Pick<AllUniversalFlatEntityMaps, 'flatRoleMaps'>) =>
  restrictMarketplaceApplicationRoleAssignabilityThroughMutation({
    manifest: {
      application: { defaultRoleUniversalIdentifier: 'requested-role' },
      roles: [
        { universalIdentifier: 'requested-role', label: 'Requested' },
        { universalIdentifier: 'agent-role', label: 'Agent' },
        { universalIdentifier: 'member-role', label: 'Member' },
      ],
      agents: [{ roleUniversalIdentifier: 'agent-role' }],
    } as unknown as Pick<Manifest, 'application' | 'roles' | 'agents'>,
    toAllUniversalFlatEntityMapsToMutate: maps,
  });

const assignabilityOf = (
  maps: Pick<AllUniversalFlatEntityMaps, 'flatRoleMaps'>,
  universalIdentifier: string,
) => {
  const role = maps.flatRoleMaps.byUniversalIdentifier[universalIdentifier];

  return {
    canBeAssignedToUsers: role?.canBeAssignedToUsers,
    canBeAssignedToApiKeys: role?.canBeAssignedToApiKeys,
    canBeAssignedToAgents: role?.canBeAssignedToAgents,
  };
};

describe('restrictMarketplaceApplicationRoleAssignabilityThroughMutation', () => {
  it.each(['requested-role', 'agent-role'])(
    'makes the %s assignable to agents only',
    (universalIdentifier) => {
      const maps = buildFlatRoleMaps([universalIdentifier]);

      restrict(maps);

      expect(assignabilityOf(maps, universalIdentifier)).toEqual({
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToAgents: true,
      });
    },
  );

  it('leaves a standalone role as declared, so the role validator refuses it', () => {
    const maps = buildFlatRoleMaps(['member-role']);

    restrict(maps);

    expect(assignabilityOf(maps, 'member-role')).toEqual(ASSIGNABLE_EVERYWHERE);
  });
});
