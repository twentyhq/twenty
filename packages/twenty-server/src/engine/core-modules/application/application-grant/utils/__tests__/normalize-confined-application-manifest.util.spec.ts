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
      { universalIdentifier: 'agent', roleUniversalIdentifier: 'requested-role' },
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
      'cannot declare row-level permission rules',
    );
  });
});
