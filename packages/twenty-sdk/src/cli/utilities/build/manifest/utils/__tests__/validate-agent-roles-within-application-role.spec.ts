import { validateAgentRolesWithinApplicationRole } from '@/cli/utilities/build/manifest/utils/validate-agent-roles-within-application-role';
import {
  type AgentManifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const APPLICATION_ROLE_UNIVERSAL_IDENTIFIER = 'application-role';
const AGENT_ROLE_UNIVERSAL_IDENTIFIER = 'agent-role';
const CUSTOM_OBJECT_UNIVERSAL_IDENTIFIER = 'custom-object';
const PERSON_UNIVERSAL_IDENTIFIER = STANDARD_OBJECTS.person.universalIdentifier;

const buildRole = (overrides: Partial<RoleManifest> = {}): RoleManifest => ({
  universalIdentifier: AGENT_ROLE_UNIVERSAL_IDENTIFIER,
  label: 'Agent role',
  ...overrides,
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
  namePlural: 'tickets',
  labelSingular: 'Ticket',
  labelPlural: 'Tickets',
  fields: [],
} as unknown as ObjectManifest;

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

  it('reports an agent role that is not defined by the application', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [buildAgent({ roleUniversalIdentifier: 'missing-role' })],
      roles: [applicationRole],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([
      'Agent "assistant" references role "missing-role", which is not defined by this application.',
    ]);
  });

  it('reports a missing application role and still checks agent role references', () => {
    const errors = validateAgentRolesWithinApplicationRole({
      agents: [
        buildAgent(),
        buildAgent({
          name: 'lost-assistant',
          roleUniversalIdentifier: 'missing-role',
        }),
      ],
      roles: [buildRole({ canReadAllObjectRecords: true })],
      objects: [],
      permissionFlags: [],
      defaultRoleUniversalIdentifier: APPLICATION_ROLE_UNIVERSAL_IDENTIFIER,
    });

    expect(errors).toEqual([
      'Application default role "application-role" is not defined by this application.',
      'Agent "lost-assistant" references role "missing-role", which is not defined by this application.',
    ]);
  });
});
