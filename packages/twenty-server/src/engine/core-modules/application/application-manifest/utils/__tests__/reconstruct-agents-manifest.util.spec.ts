import {
  type AgentManifest,
  getRoleTargetUniversalIdentifier,
} from 'twenty-shared/application';

import { fromAgentManifestToUniversalFlatRoleTarget } from 'src/engine/core-modules/application/application-manifest/converters/from-agent-manifest-to-universal-flat-role-target.util';
import { fromRoleManifestToUniversalFlatRole } from 'src/engine/core-modules/application/application-manifest/converters/from-role-manifest-to-universal-flat-role.util';
import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { reconstructAgentsManifest } from 'src/engine/core-modules/application/application-manifest/utils/reconstruct-agents-manifest.util';
import { ApplicationExportCoverageStatus } from 'src/engine/core-modules/application/enums/application-export-coverage-status.enum';
import { fromAgentManifestToUniversalFlatAgent } from 'src/engine/core-modules/application/utils/from-agent-manifest-to-universal-flat-agent.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatRoleTarget } from 'src/engine/metadata-modules/flat-role-target/types/flat-role-target.type';
import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';

const APP_ID = 'application-id';
const STANDARD_APP_ID = 'standard-application-id';
const WORKSPACE_ID = 'workspace-id';
const NOW = '2026-09-14T10:00:00.000Z';
const APP_UNIVERSAL_IDENTIFIER = '10000000-0000-4000-8000-000000000001';
const SUPPORT_ROLE_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000001';
const UNSUPPORTED_ROLE_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000002';
const STANDARD_ROLE_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000003';
const MISSING_ROLE_UNIVERSAL_IDENTIFIER =
  '20000000-0000-4000-8000-000000000004';
const SUPPORT_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000001';
const STANDARD_ROLE_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000002';
const UNSUPPORTED_ROLE_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000003';
const MISSING_ROLE_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000004';
const TWO_ROLES_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000005';
const WORKSPACE_ROLE_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000006';
const CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000007';
const FOREIGN_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-000000000009';
const UNASSIGNED_AGENT_UNIVERSAL_IDENTIFIER =
  '30000000-0000-4000-8000-00000000000a';
const WORKSPACE_ROLE_TARGET_UNIVERSAL_IDENTIFIER =
  '40000000-0000-4000-8000-000000000001';
const SECOND_ROLE_TARGET_UNIVERSAL_IDENTIFIER =
  '40000000-0000-4000-8000-000000000002';

const buildAgentManifest = (universalIdentifier: string): AgentManifest => ({
  universalIdentifier,
  name: `agent-${universalIdentifier.slice(-1)}`,
  label: 'Agent',
  prompt: 'Help the user.',
  responseFormat: { type: 'text' },
});

const buildFlatAgent = (
  universalIdentifier: string,
  overrides: Partial<FlatAgent> = {},
): FlatAgent => ({
  ...fromAgentManifestToUniversalFlatAgent({
    agentManifest: buildAgentManifest(universalIdentifier),
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    now: NOW,
  }),
  id: `${universalIdentifier}-id`,
  workspaceId: WORKSPACE_ID,
  applicationId: APP_ID,
  ...overrides,
});

const buildFlatRole = ({
  universalIdentifier,
  applicationId = APP_ID,
}: {
  universalIdentifier: string;
  applicationId?: string;
}): FlatRole =>
  ({
    ...fromRoleManifestToUniversalFlatRole({
      roleManifest: { universalIdentifier, label: 'Role' },
      applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      now: NOW,
    }),
    id: `${universalIdentifier}-id`,
    workspaceId: WORKSPACE_ID,
    applicationId,
  }) as FlatRole;

const buildFlatRoleTarget = ({
  agentUniversalIdentifier,
  roleUniversalIdentifier,
  universalIdentifier,
}: {
  agentUniversalIdentifier: string;
  roleUniversalIdentifier: string;
  universalIdentifier?: string;
}): FlatRoleTarget => {
  const universalFlatRoleTarget = fromAgentManifestToUniversalFlatRoleTarget({
    agentUniversalIdentifier,
    roleUniversalIdentifier,
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    now: NOW,
  });

  return {
    ...universalFlatRoleTarget,
    universalIdentifier:
      universalIdentifier ?? universalFlatRoleTarget.universalIdentifier,
    id: `${universalIdentifier ?? agentUniversalIdentifier}-role-target-id`,
    workspaceId: WORKSPACE_ID,
    applicationId: APP_ID,
    roleId: `${roleUniversalIdentifier}-id`,
    agentId: `${agentUniversalIdentifier}-id`,
  };
};

const buildMaps = ({
  agents = [],
  roles = [],
  roleTargets = [],
}: {
  agents?: FlatAgent[];
  roles?: FlatRole[];
  roleTargets?: FlatRoleTarget[];
}): AllFlatEntityMaps => {
  const maps = createEmptyAllFlatEntityMaps();

  return {
    ...maps,
    flatAgentMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: agents,
      flatEntityMaps: maps.flatAgentMaps,
    }),
    flatRoleMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: roles,
      flatEntityMaps: maps.flatRoleMaps,
    }),
    flatRoleTargetMaps: addAllFlatEntitiesToFlatEntityMaps({
      flatEntities: roleTargets,
      flatEntityMaps: maps.flatRoleTargetMaps,
    }),
  };
};

const applicationAgents = [
  buildFlatAgent(SUPPORT_AGENT_UNIVERSAL_IDENTIFIER, {
    icon: 'IconRobot',
    triggers: [
      {
        id: '50000000-0000-4000-8000-000000000001',
        type: 'CRON',
        settings: { pattern: '0 9 * * 1' },
        isActive: true,
        instructions: null,
      },
    ],
  }),
  buildFlatAgent(STANDARD_ROLE_AGENT_UNIVERSAL_IDENTIFIER),
  buildFlatAgent(UNSUPPORTED_ROLE_AGENT_UNIVERSAL_IDENTIFIER),
  buildFlatAgent(MISSING_ROLE_AGENT_UNIVERSAL_IDENTIFIER),
  buildFlatAgent(TWO_ROLES_AGENT_UNIVERSAL_IDENTIFIER),
  buildFlatAgent(WORKSPACE_ROLE_AGENT_UNIVERSAL_IDENTIFIER),
  buildFlatAgent(CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER, {
    modelConfiguration: { webSearch: { enabled: true } },
    isSystem: true,
  }),
  buildFlatAgent(UNASSIGNED_AGENT_UNIVERSAL_IDENTIFIER),
];
const applicationRoles = [
  buildFlatRole({ universalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER }),
  buildFlatRole({ universalIdentifier: UNSUPPORTED_ROLE_UNIVERSAL_IDENTIFIER }),
];
const applicationRoleTargets = [
  buildFlatRoleTarget({
    agentUniversalIdentifier: SUPPORT_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: STANDARD_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: STANDARD_ROLE_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: UNSUPPORTED_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: UNSUPPORTED_ROLE_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: MISSING_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: MISSING_ROLE_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: TWO_ROLES_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: TWO_ROLES_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: STANDARD_ROLE_UNIVERSAL_IDENTIFIER,
    universalIdentifier: SECOND_ROLE_TARGET_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: WORKSPACE_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
    universalIdentifier: WORKSPACE_ROLE_TARGET_UNIVERSAL_IDENTIFIER,
  }),
  buildFlatRoleTarget({
    agentUniversalIdentifier: FOREIGN_AGENT_UNIVERSAL_IDENTIFIER,
    roleUniversalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
  }),
];

const applicationAllFlatEntityMaps = buildMaps({
  agents: applicationAgents,
  roles: applicationRoles,
  roleTargets: applicationRoleTargets,
});
const allFlatEntityMaps = buildMaps({
  agents: applicationAgents,
  roles: [
    ...applicationRoles,
    buildFlatRole({
      universalIdentifier: STANDARD_ROLE_UNIVERSAL_IDENTIFIER,
      applicationId: STANDARD_APP_ID,
    }),
  ],
  roleTargets: applicationRoleTargets,
});

const { agents, coverage } = reconstructAgentsManifest({
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  resolvableRoleUniversalIdentifiers: new Set([
    SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
  ]),
});

const roleTargetUniversalIdentifierOf = (agentUniversalIdentifier: string) =>
  getRoleTargetUniversalIdentifier({
    applicationUniversalIdentifier: APP_UNIVERSAL_IDENTIFIER,
    agentUniversalIdentifier,
  });

const findCoverage = (metadataName: string, universalIdentifier: string) =>
  coverage.find(
    (entry) =>
      entry.metadataName === metadataName &&
      entry.universalIdentifier === universalIdentifier,
  );

describe('reconstructAgentsManifest', () => {
  it('should export an agent with its exported role and triggers', () => {
    expect(
      agents.find(
        ({ universalIdentifier }) =>
          universalIdentifier === SUPPORT_AGENT_UNIVERSAL_IDENTIFIER,
      ),
    ).toEqual({
      ...buildAgentManifest(SUPPORT_AGENT_UNIVERSAL_IDENTIFIER),
      icon: 'IconRobot',
      roleUniversalIdentifier: SUPPORT_ROLE_UNIVERSAL_IDENTIFIER,
      triggers: [
        {
          universalIdentifier: '50000000-0000-4000-8000-000000000001',
          type: 'CRON',
          settings: { pattern: '0 9 * * 1' },
        },
      ],
    });
    expect(
      findCoverage('agent', SUPPORT_AGENT_UNIVERSAL_IDENTIFIER)?.status,
    ).toBe(ApplicationExportCoverageStatus.EXPORTED);
    expect(
      findCoverage(
        'roleTarget',
        roleTargetUniversalIdentifierOf(SUPPORT_AGENT_UNIVERSAL_IDENTIFIER),
      )?.status,
    ).toBe(ApplicationExportCoverageStatus.EXPORTED);
  });

  it('should export an agent with its model configuration and system flag', () => {
    expect(
      agents.find(
        ({ universalIdentifier }) =>
          universalIdentifier === CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER,
      ),
    ).toEqual({
      ...buildAgentManifest(CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER),
      modelConfiguration: { webSearch: { enabled: true } },
      isSystem: true,
    });
    expect(
      findCoverage('agent', CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER)?.status,
    ).toBe(ApplicationExportCoverageStatus.EXPORTED);
  });

  it('should export an agent bound to a role outside the application and one without a role', () => {
    expect(
      agents.map(({ universalIdentifier }) => universalIdentifier),
    ).toEqual([
      SUPPORT_AGENT_UNIVERSAL_IDENTIFIER,
      STANDARD_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      CONFIGURED_AGENT_UNIVERSAL_IDENTIFIER,
      UNASSIGNED_AGENT_UNIVERSAL_IDENTIFIER,
    ]);
    expect(
      agents.find(
        ({ universalIdentifier }) =>
          universalIdentifier === STANDARD_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      )?.roleUniversalIdentifier,
    ).toBe(STANDARD_ROLE_UNIVERSAL_IDENTIFIER);
    expect(
      agents.find(
        ({ universalIdentifier }) =>
          universalIdentifier === UNASSIGNED_AGENT_UNIVERSAL_IDENTIFIER,
      ),
    ).not.toHaveProperty('roleUniversalIdentifier');
  });

  it.each([
    [
      UNSUPPORTED_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      'agent on an unsupported role',
    ],
    [
      MISSING_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      'agent on a role that does not exist',
    ],
    [TWO_ROLES_AGENT_UNIVERSAL_IDENTIFIER, 'agent with more than one role'],
    [
      WORKSPACE_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      'agent whose role was assigned outside its definition',
    ],
  ])(
    'should report agent %s as unsupported: %s',
    (universalIdentifier, reason) => {
      expect(findCoverage('agent', universalIdentifier)).toEqual({
        metadataName: 'agent',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason,
      });
    },
  );

  it.each([
    [
      roleTargetUniversalIdentifierOf(
        UNSUPPORTED_ROLE_AGENT_UNIVERSAL_IDENTIFIER,
      ),
      'role target of an agent that is not exported',
    ],
    [
      SECOND_ROLE_TARGET_UNIVERSAL_IDENTIFIER,
      'role target of an agent that is not exported',
    ],
    [
      WORKSPACE_ROLE_TARGET_UNIVERSAL_IDENTIFIER,
      'role target of an agent that is not exported',
    ],
    [
      roleTargetUniversalIdentifierOf(FOREIGN_AGENT_UNIVERSAL_IDENTIFIER),
      'role target of an agent outside the application',
    ],
  ])(
    'should report role target %s as unsupported: %s',
    (universalIdentifier, reason) => {
      expect(findCoverage('roleTarget', universalIdentifier)).toEqual({
        metadataName: 'roleTarget',
        universalIdentifier,
        status: ApplicationExportCoverageStatus.UNSUPPORTED,
        reason,
      });
    },
  );
});
