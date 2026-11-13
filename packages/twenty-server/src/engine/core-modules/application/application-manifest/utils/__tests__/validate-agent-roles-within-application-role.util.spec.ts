import {
  type AgentManifest,
  type RoleManifest,
  normalizeLegacyCompliantRoleManifest,
  type LegacyCompliantRoleManifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { validateAgentRolesWithinApplicationRole } from 'src/engine/core-modules/application/application-manifest/utils/validate-agent-roles-within-application-role.util';

const APPLICATION_ROLE_UNIVERSAL_IDENTIFIER = 'application-role';
const AGENT_ROLE_UNIVERSAL_IDENTIFIER = 'agent-role';
const CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER = 'custom-object';
const PERSON_UNIVERSAL_IDENTIFIER = STANDARD_OBJECTS.person.universalIdentifier;

const buildRole = (
  overrides: Partial<LegacyCompliantRoleManifest> = {},
): RoleManifest =>
  normalizeLegacyCompliantRoleManifest({
    role: {
      universalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
      label: 'Agent role',
      ...overrides,
    },
    applicationUniversalIdentifier: '7a3b1c9e-5d2f-4e8a-9b6c-1f0e2d3c4b5a',
  });

const applicationRole = buildRole({
  universalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Application role',
  objectPermissions: [
    {
      objectUniversalIdentifier: PERSON_UNIVERSAL_IDENTIFIER,
      canReadObjectRecords: true,
    },
  ],
  permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
});

const buildAgent = (overrides: Partial<AgentManifest> = {}): AgentManifest => ({
  universalIdentifier: 'agent',
  name: 'assistant',
  label: 'Assistant',
  prompt: 'Help.',
  roleUniversalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
  ...overrides,
});

const customObject = {
  universalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'ticket',
};

describe('validateAgentRolesWithinApplicationRole', () => {
  it('accepts an agent role the application role covers', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent()],
      roles: [
        applicationRole,
        buildRole({
          objectPermissions: [
            {
              objectUniversalIdentifier: PERSON_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.AI],
        }),
      ],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([]);
  });

  it('ignores agents without a role and agents on the application role', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [
        buildAgent({ roleUniversalIdentifier: undefined }),
        buildAgent({
          roleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
        }),
      ],
      roles: [applicationRole],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([]);
  });

  it('reports every grant an agent role has beyond the application role', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent(), buildAgent({ name: 'second-assistant' })],
      roles: [
        applicationRole,
        buildRole({
          objectPermissions: [
            {
              objectUniversalIdentifier: PERSON_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
            },
            {
              objectUniversalIdentifier: CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.AI,
            SystemPermissionFlag.WORKFLOWS,
          ],
        }),
      ],
      objects: [customObject],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([
      'Role "Agent role" used by agent "assistant", "second-assistant" grants more than the application role "Application role": permission flag WORKFLOWS, update person records, read ticket records. The application role must cover every permission an agent role grants.',
    ]);
  });

  it('names system flags as the app SDK does', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent()],
      roles: [
        applicationRole,
        buildRole({
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.CONNECTED_ACCOUNTS,
          ],
        }),
      ],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
      systemPermissionFlag: {
        USER_APPS: SystemPermissionFlag.CONNECTED_ACCOUNTS,
        ...SystemPermissionFlag,
      },
    });

    expect(errors).toEqual([
      'Role "Agent role" used by agent "assistant" grants more than the application role "Application role": permission flag USER_APPS. The application role must cover every permission an agent role grants.',
    ]);
  });

  it('treats a custom permission flag without a permission type as a tool flag, like the server does', () => {
    const customToolFlagUniversalIdentifier = 'custom-tool-flag';

    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent()],
      roles: [
        buildRole({
          universalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Application role',
          canAccessAllTools: true,
        }),
        buildRole({
          permissionFlagUniversalIdentifiers: [
            customToolFlagUniversalIdentifier,
          ],
        }),
      ],
      objects: [],
      permissionFlags: [
        {
          universalIdentifier: customToolFlagUniversalIdentifier,
          key: 'CUSTOM_TOOL',
        },
      ],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([]);
  });

  it('reports a custom settings flag that access to all tools does not cover', () => {
    const customSettingsFlagUniversalIdentifier = 'custom-settings-flag';

    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent()],
      roles: [
        buildRole({
          universalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
          label: 'Application role',
          canAccessAllTools: true,
        }),
        buildRole({
          permissionFlagUniversalIdentifiers: [
            customSettingsFlagUniversalIdentifier,
          ],
        }),
      ],
      objects: [],
      permissionFlags: [
        {
          universalIdentifier: customSettingsFlagUniversalIdentifier,
          key: 'CUSTOM_SETTINGS',
          permissionType: 'settings',
        },
      ],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([
      'Role "Agent role" used by agent "assistant" grants more than the application role "Application role": permission flag CUSTOM_SETTINGS. The application role must cover every permission an agent role grants.',
    ]);
  });

  it('accepts an external application role without a local definition', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [
        buildAgent({ roleUniversalIdentifier: undefined }),
        buildAgent({
          roleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
        }),
      ],
      roles: [],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([]);
  });
});
