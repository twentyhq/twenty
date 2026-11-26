import { assertWorkspaceDefaultRoleStaysAssignableToUsers } from 'src/engine/core-modules/application/application-manifest/utils/assert-workspace-default-role-stays-assignable-to-users.util';
import { type FlatRoleMaps } from 'src/engine/metadata-modules/flat-role/types/flat-role-maps.type';

const existingFlatRoleMaps = {
  byUniversalIdentifier: {
    'requested-role': {
      id: 'requested-role-id',
      universalIdentifier: 'requested-role',
      label: 'Partner',
      canBeAssignedToUsers: true,
    },
  },
  universalIdentifierById: { 'requested-role-id': 'requested-role' },
  universalIdentifiersByApplicationId: {},
} as unknown as FlatRoleMaps;

const assertFor = ({
  workspaceDefaultRoleId,
  canBeAssignedToUsers,
}: {
  workspaceDefaultRoleId: string | null;
  canBeAssignedToUsers: boolean;
}) =>
  assertWorkspaceDefaultRoleStaysAssignableToUsers({
    workspaceDefaultRoleId,
    existingFlatRoleMaps,
    toUniversalFlatRoleMaps: {
      byUniversalIdentifier: { 'requested-role': { canBeAssignedToUsers } },
    },
  });

describe('assertWorkspaceDefaultRoleStaysAssignableToUsers', () => {
  it('refuses a sync that makes the workspace default role unassignable to users, naming the role', () => {
    expect(() =>
      assertFor({
        workspaceDefaultRoleId: 'requested-role-id',
        canBeAssignedToUsers: false,
      }),
    ).toThrow('Role "Partner" is the workspace default role');
  });

  it('accepts the sync once the default role is another role', () => {
    expect(() =>
      assertFor({
        workspaceDefaultRoleId: 'member-role-id',
        canBeAssignedToUsers: false,
      }),
    ).not.toThrow();
  });

  it('accepts a sync that keeps the default role assignable', () => {
    expect(() =>
      assertFor({
        workspaceDefaultRoleId: 'requested-role-id',
        canBeAssignedToUsers: true,
      }),
    ).not.toThrow();
  });
});
