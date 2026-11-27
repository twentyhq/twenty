import {
  APPLICATION,
  buildFlatRole,
  buildFlatRoleTarget,
  buildRoleTargetAndAgentMaps,
  WORKSPACE_CUSTOM_APPLICATION,
} from 'src/database/commands/upgrade-version-command/2-66/utils/__tests__/marketplace-application-role.fixtures';
import {
  findOutsideHolderFlatRoleTargets,
  selectMarketplaceApplicationRoles,
} from 'src/database/commands/upgrade-version-command/2-66/utils/select-marketplace-application-roles.util';

const requestedFlatRole = buildFlatRole({
  id: 'requested-role-id',
  universalIdentifier: 'requested-role',
});
const agentFlatRole = buildFlatRole({ universalIdentifier: 'agent-role' });
const standaloneFlatRole = buildFlatRole({
  universalIdentifier: 'standalone-role',
});
const otherApplicationFlatRole = buildFlatRole({
  universalIdentifier: 'other-application-role',
  applicationUniversalIdentifier: WORKSPACE_CUSTOM_APPLICATION,
});

const flatRoleTargets = [
  buildFlatRoleTarget({
    universalIdentifier: 'own-agent-on-agent-role',
    roleUniversalIdentifier: 'agent-role',
    agentUniversalIdentifier: 'own-agent',
    applicationUniversalIdentifier: APPLICATION,
  }),
  buildFlatRoleTarget({
    universalIdentifier: 'own-agent-on-requested-role',
    roleUniversalIdentifier: 'requested-role',
    agentUniversalIdentifier: 'own-agent',
    applicationUniversalIdentifier: APPLICATION,
  }),
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
  buildFlatRoleTarget({
    universalIdentifier: 'standalone-member',
    roleUniversalIdentifier: 'standalone-role',
    userWorkspaceId: 'user-workspace-id',
  }),
];

const { flatRoleTargetMaps, flatAgentMaps } = buildRoleTargetAndAgentMaps({
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
});

const flatRoleMaps = {
  byUniversalIdentifier: Object.fromEntries(
    [
      requestedFlatRole,
      agentFlatRole,
      standaloneFlatRole,
      otherApplicationFlatRole,
    ].map((flatRole) => [flatRole.universalIdentifier, flatRole]),
  ),
  universalIdentifierById: {},
  universalIdentifiersByApplicationId: {},
};

const select = () =>
  selectMarketplaceApplicationRoles({
    flatApplication: {
      universalIdentifier: APPLICATION,
      requestedRoleId: 'requested-role-id',
    },
    flatRoleMaps,
    flatRoleTargetMaps,
    flatAgentMaps,
  });

describe('selectMarketplaceApplicationRoles', () => {
  it('splits the application roles into requested and agent roles, and standalone roles', () => {
    const { requestedAndAgentFlatRoles, standaloneFlatRoles } = select();

    expect(
      requestedAndAgentFlatRoles.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).toEqual(['requested-role', 'agent-role']);
    expect(
      standaloneFlatRoles.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['standalone-role']);
  });

  it('leaves out roles owned by another application and the grant', () => {
    const grantFlatRole = buildFlatRole({
      universalIdentifier: 'grant',
      canBeAssignedToApplications: true,
    });

    const { requestedAndAgentFlatRoles, standaloneFlatRoles } =
      selectMarketplaceApplicationRoles({
        flatApplication: {
          universalIdentifier: APPLICATION,
          requestedRoleId: 'requested-role-id',
        },
        flatRoleMaps: {
          ...flatRoleMaps,
          byUniversalIdentifier: {
            ...flatRoleMaps.byUniversalIdentifier,
            grant: grantFlatRole,
          },
        },
        flatRoleTargetMaps,
        flatAgentMaps,
      });

    expect(
      [...requestedAndAgentFlatRoles, ...standaloneFlatRoles].map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    ).not.toEqual(expect.arrayContaining(['grant', 'other-application-role']));
  });
});

describe('findOutsideHolderFlatRoleTargets', () => {
  it('finds members, API keys, webhooks and other agents, but not the application own agents', () => {
    const { ownAgentUniversalIdentifiers } = select();

    expect(
      findOutsideHolderFlatRoleTargets({
        flatRole: requestedFlatRole,
        flatRoleTargetMaps,
        ownAgentUniversalIdentifiers,
      }).map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual(['member', 'api-key', 'webhook', 'custom-agent']);
  });

  it('finds holders even when the role flags are already off', () => {
    const { ownAgentUniversalIdentifiers } = select();

    expect(
      findOutsideHolderFlatRoleTargets({
        flatRole: {
          universalIdentifier: buildFlatRole({
            universalIdentifier: 'requested-role',
            canBeAssignedToUsers: false,
            canBeAssignedToApiKeys: false,
          }).universalIdentifier,
        },
        flatRoleTargetMaps,
        ownAgentUniversalIdentifiers,
      }),
    ).toHaveLength(4);
  });

  it('never counts an application target as a holder', () => {
    expect(
      findOutsideHolderFlatRoleTargets({
        flatRole: { universalIdentifier: 'grant' },
        flatRoleTargetMaps: buildRoleTargetAndAgentMaps({
          flatRoleTargets: [
            buildFlatRoleTarget({
              universalIdentifier: 'grant-target',
              roleUniversalIdentifier: 'grant',
              targetApplicationUniversalIdentifier: APPLICATION,
            }),
          ],
          agents: [],
        }).flatRoleTargetMaps,
        ownAgentUniversalIdentifiers: new Set(),
      }),
    ).toEqual([]);
  });
});
