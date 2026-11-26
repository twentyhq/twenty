import { restrictMarketplaceApplicationRoleAssignabilityThroughMutation } from 'src/engine/core-modules/application/application-manifest/utils/restrict-marketplace-application-role-assignability-through-mutation.util';

const ASSIGNABLE_EVERYWHERE = {
  canBeAssignedToUsers: true,
  canBeAssignedToApiKeys: true,
  canBeAssignedToAgents: true,
};

const restrictRole = (universalIdentifier: string) => {
  const flatRoleMaps = {
    byUniversalIdentifier: { [universalIdentifier]: ASSIGNABLE_EVERYWHERE },
  };

  restrictMarketplaceApplicationRoleAssignabilityThroughMutation({
    manifest: {
      application: { defaultRoleUniversalIdentifier: 'requested-role' },
      roles: [
        { universalIdentifier: 'requested-role' },
        { universalIdentifier: 'agent-role' },
        { universalIdentifier: 'member-role' },
      ],
      agents: [{ roleUniversalIdentifier: 'agent-role' }],
    },
    toAllUniversalFlatEntityMapsToMutate: { flatRoleMaps },
  });

  return flatRoleMaps.byUniversalIdentifier[universalIdentifier];
};

describe('restrictMarketplaceApplicationRoleAssignabilityThroughMutation', () => {
  it.each(['requested-role', 'agent-role'])(
    'makes the %s assignable to agents only',
    (universalIdentifier) => {
      expect(restrictRole(universalIdentifier)).toEqual({
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToAgents: true,
      });
    },
  );

  it('leaves a standalone role as declared, so the role validator refuses it', () => {
    expect(restrictRole('member-role')).toEqual(ASSIGNABLE_EVERYWHERE);
  });
});
