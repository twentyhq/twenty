import { type Manifest } from 'twenty-shared/application';

import { normalizeConfinedApplicationManifest } from 'src/engine/core-modules/application/application-grant/utils/normalize-confined-application-manifest.util';

const buildManifest = (overrides: Partial<Manifest> = {}): Manifest =>
  ({
    application: { defaultRoleUniversalIdentifier: 'requested-role' },
    objects: [{ universalIdentifier: 'own-object', fields: [] }],
    roles: [
      {
        universalIdentifier: 'requested-role',
        label: 'Requested role',
        objectPermissions: [
          { objectUniversalIdentifier: 'company', canReadObjectRecords: true },
        ],
      },
    ],
    agents: [
      {
        universalIdentifier: 'agent',
        roleUniversalIdentifier: 'requested-role',
      },
    ],
    ...overrides,
  }) as unknown as Manifest;

describe('normalizeConfinedApplicationManifest', () => {
  it('requests own objects with every action, assigns the request to nothing and lets agents use the grant', () => {
    const manifest = normalizeConfinedApplicationManifest(buildManifest());
    const [requestedRole] = manifest.roles;

    expect(requestedRole.canBeAssignedToUsers).toBe(false);
    expect(requestedRole.canBeAssignedToAgents).toBe(false);
    expect(requestedRole.canBeAssignedToApiKeys).toBe(false);
    expect(requestedRole.objectPermissions).toContainEqual({
      objectUniversalIdentifier: 'own-object',
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    });
    expect(manifest.agents?.[0].roleUniversalIdentifier).toBeUndefined();
  });

  it('rejects row-level rules in the requested role', () => {
    const manifest = buildManifest();

    manifest.roles[0].rowLevelPermissionPredicates = [
      {
        universalIdentifier: 'predicate',
        objectUniversalIdentifier: 'company',
        fieldUniversalIdentifier: 'name',
        operand: 'IS' as never,
      },
    ];

    expect(() => normalizeConfinedApplicationManifest(manifest)).toThrow(
      'cannot declare field permissions or row-level permission rules',
    );
  });

  it('rejects field permissions in the requested role', () => {
    const manifest = buildManifest();

    manifest.roles[0].fieldPermissions = [
      {
        objectUniversalIdentifier: 'company',
        fieldUniversalIdentifier: 'name',
        canReadFieldValue: false,
      },
    ];

    expect(() => normalizeConfinedApplicationManifest(manifest)).toThrow(
      'cannot declare field permissions or row-level permission rules',
    );
  });

  it('rejects field permissions in a role an agent uses, and keeps them on member roles', () => {
    const memberRole = {
      universalIdentifier: 'member-role',
      label: 'Member role',
      fieldPermissions: [
        {
          objectUniversalIdentifier: 'company',
          fieldUniversalIdentifier: 'name',
          canReadFieldValue: false,
        },
      ],
    };
    const manifest = buildManifest();

    manifest.roles.push(memberRole);

    expect(() => normalizeConfinedApplicationManifest(manifest)).not.toThrow();

    manifest.agents?.push({
      universalIdentifier: 'other-agent',
      roleUniversalIdentifier: 'member-role',
    } as never);

    expect(() => normalizeConfinedApplicationManifest(manifest)).toThrow(
      'Role "Member role" is the application role or an agent role',
    );
  });
});
