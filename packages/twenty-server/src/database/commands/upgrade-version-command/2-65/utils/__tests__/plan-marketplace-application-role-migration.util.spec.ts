import {
  APPLICATION,
  buildFlatRole,
  buildFlatRoleTarget,
  buildRequestedRoleFixture,
  buildRoleTargetAndAgentMaps,
  NOW,
  withFlatRoles,
  WORKSPACE_CUSTOM_APPLICATION,
} from 'src/database/commands/upgrade-version-command/2-65/utils/__tests__/marketplace-application-role.fixtures';
import { getMarketplaceApplicationRoleCloneUniversalIdentifier } from 'src/database/commands/upgrade-version-command/2-65/utils/build-marketplace-application-role-clone.util';
import {
  buildMarketplaceApplicationRoleOperations,
  planMarketplaceApplicationRoleMigration,
  type PendingInvitation,
} from 'src/database/commands/upgrade-version-command/2-65/utils/plan-marketplace-application-role-migration.util';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const CLONE_ROLE_UNIVERSAL_IDENTIFIER =
  getMarketplaceApplicationRoleCloneUniversalIdentifier({
    originalRoleUniversalIdentifier: 'requested-role',
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
  });

const OUTSIDE_HOLDERS = [
  buildFlatRoleTarget({
    universalIdentifier: 'member',
    roleUniversalIdentifier: 'requested-role',
    userWorkspaceId: 'user-workspace-id',
  }),
  buildFlatRoleTarget({
    universalIdentifier: 'api-key',
    roleUniversalIdentifier: 'requested-role',
    apiKeyId: 'api-key-id',
  }),
  buildFlatRoleTarget({
    universalIdentifier: 'webhook',
    roleUniversalIdentifier: 'requested-role',
    webhookUniversalIdentifier: 'webhook',
  }),
  buildFlatRoleTarget({
    universalIdentifier: 'custom-agent',
    roleUniversalIdentifier: 'requested-role',
    agentUniversalIdentifier: 'custom-agent',
  }),
];

const OWN_AGENT_TARGET = buildFlatRoleTarget({
  universalIdentifier: 'own-agent',
  roleUniversalIdentifier: 'requested-role',
  agentUniversalIdentifier: 'own-agent',
  applicationUniversalIdentifier: APPLICATION,
});

const plan = ({
  flatRoleTargets = [...OUTSIDE_HOLDERS, OWN_AGENT_TARGET],
  workspaceDefaultRoleId = null,
  pendingInvitations = [],
  extraFlatRoles = [],
  requestedRoleOverrides = {},
}: {
  flatRoleTargets?: ReturnType<typeof buildFlatRoleTarget>[];
  workspaceDefaultRoleId?: string | null;
  pendingInvitations?: PendingInvitation[];
  extraFlatRoles?: FlatRole[];
  requestedRoleOverrides?: Partial<FlatRole>;
} = {}) => {
  const { requestedFlatRole, flatEntityMaps } = buildRequestedRoleFixture();

  return planMarketplaceApplicationRoleMigration({
    flatApplication: {
      universalIdentifier: APPLICATION,
      requestedRoleId: requestedFlatRole.id,
    },
    workspaceCustomApplicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    workspaceDefaultRoleId,
    pendingInvitations,
    flatEntityMaps: withFlatRoles(flatEntityMaps, [
      { ...requestedFlatRole, ...requestedRoleOverrides },
      ...extraFlatRoles,
    ]),
    ...buildRoleTargetAndAgentMaps({
      flatRoleTargets,
      agents: [
        {
          universalIdentifier: 'own-agent',
          applicationUniversalIdentifier: APPLICATION,
        },
        {
          universalIdentifier: 'custom-agent',
          applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
        },
      ],
    }),
    generateId: () => 'clone-role-id',
    now: NOW,
  });
};

describe('planMarketplaceApplicationRoleMigration', () => {
  it('clones a requested role held from outside the application and moves every outside holder', () => {
    const [{ holderMove }] = plan();

    expect(holderMove?.clone?.role.universalIdentifier).toBe(
      CLONE_ROLE_UNIVERSAL_IDENTIFIER,
    );
    expect(
      holderMove?.holderFlatRoleTargets.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(['member', 'api-key', 'webhook', 'custom-agent']);
  });

  it('does not clone a role only the application own agents hold', () => {
    const [{ holderMove, cleanup }] = plan({
      flatRoleTargets: [OWN_AGENT_TARGET],
    });

    expect(holderMove).toBeUndefined();
    expect(cleanup.rowLevelPermissionRulesToDelete).toHaveLength(2);
  });

  it('clones a role that is the workspace default role or carried by an invitation, assignable to users', () => {
    const [{ holderMove }] = plan({
      flatRoleTargets: [OWN_AGENT_TARGET],
      workspaceDefaultRoleId: 'requested-role-id',
      pendingInvitations: [
        { id: 'invitation-id', roleId: 'requested-role-id' },
        { id: 'other-invitation-id', roleId: 'member-role-id' },
      ],
      requestedRoleOverrides: {
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
      },
    });

    expect(holderMove).toMatchObject({
      isWorkspaceDefaultRole: true,
      invitationIds: ['invitation-id'],
    });
    expect(holderMove?.clone?.role).toMatchObject({
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: false,
    });
  });

  it('makes the clone accept its holders when the original flags are already off', () => {
    const [{ holderMove }] = plan({
      requestedRoleOverrides: {
        canBeAssignedToUsers: false,
        canBeAssignedToApiKeys: false,
        canBeAssignedToAgents: false,
      },
    });

    expect(holderMove?.clone?.role).toMatchObject({
      canBeAssignedToUsers: true,
      canBeAssignedToApiKeys: true,
      canBeAssignedToAgents: true,
    });
  });

  it('reuses a clone created by an earlier run', () => {
    const existingClone = buildFlatRole({
      id: 'existing-clone-id',
      universalIdentifier: CLONE_ROLE_UNIVERSAL_IDENTIFIER,
      applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
    });

    const [{ holderMove }] = plan({ extraFlatRoles: [existingClone] });

    expect(holderMove).toMatchObject({
      clone: undefined,
      cloneRoleId: 'existing-clone-id',
      cloneRoleUniversalIdentifier: CLONE_ROLE_UNIVERSAL_IDENTIFIER,
    });
  });
});

describe('buildMarketplaceApplicationRoleOperations', () => {
  it('runs the clone and the moves as the custom application, and the cleanup as the marketplace application', () => {
    const {
      workspaceCustomApplicationOperations,
      applicationOperations,
      summary,
    } = buildMarketplaceApplicationRoleOperations({ plans: plan(), now: NOW });

    expect(
      workspaceCustomApplicationOperations.role?.flatEntityToCreate,
    ).toHaveLength(1);
    expect(
      workspaceCustomApplicationOperations.roleTarget?.flatEntityToUpdate.map(
        ({ roleUniversalIdentifier }) => roleUniversalIdentifier,
      ),
    ).toEqual(Array(4).fill(CLONE_ROLE_UNIVERSAL_IDENTIFIER));
    expect(
      workspaceCustomApplicationOperations.rowLevelPermissionRule
        ?.flatEntityToCreate,
    ).toHaveLength(2);

    expect(applicationOperations.role?.flatEntityToUpdate).toEqual([
      expect.objectContaining({
        universalIdentifier: 'requested-role',
        canBeAssignedToUsers: false,
      }),
    ]);
    expect(
      applicationOperations.rowLevelPermissionRule?.flatEntityToDelete,
    ).toHaveLength(2);

    expect(summary).toEqual({
      rolesCloned: 1,
      membersMoved: 1,
      apiKeysMoved: 1,
      webhooksMoved: 1,
      agentsMoved: 1,
      defaultRolesMoved: 0,
      invitationsRepointed: 0,
      objectPermissionsWidened: 2,
      rulesDropped: 2,
      predicateGroupsDropped: 1,
      predicatesDropped: 1,
      fieldPermissionsDropped: 2,
      rolesMadeAgentOnly: 1,
    });
  });

  it('has nothing to do once a run went through', () => {
    const migratedRequestedRole = {
      canBeAssignedToUsers: false,
      canBeAssignedToApiKeys: false,
      fieldPermissionUniversalIdentifiers: [],
      rowLevelPermissionRuleUniversalIdentifiers: [],
      rowLevelPermissionPredicateGroupUniversalIdentifiers: [],
      rowLevelPermissionPredicateUniversalIdentifiers: [],
    };

    const { workspaceCustomApplicationOperations, applicationOperations } =
      buildMarketplaceApplicationRoleOperations({
        plans: plan({
          flatRoleTargets: [OWN_AGENT_TARGET],
          requestedRoleOverrides: migratedRequestedRole,
        }),
        now: NOW,
      });

    expect(workspaceCustomApplicationOperations).toEqual({});
    expect(applicationOperations).toEqual({});
  });
});
