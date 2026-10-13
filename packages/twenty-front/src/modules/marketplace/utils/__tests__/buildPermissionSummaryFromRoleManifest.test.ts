import { type RoleManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { buildPermissionSummaryFromRoleManifest } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

const baseRole: RoleManifest = {
  universalIdentifier: 'test-role',
  label: 'Test Role',
};

const PERSON_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-e674-48e5-a542-72570eee7213';
const COMPANY_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-b374-4779-a561-80086cb2e17f';
const TASK_OBJECT_UNIVERSAL_IDENTIFIER = '20202020-1ba1-48ba-bc83-ef7e5990ed10';

const objectLabelsByUniversalIdentifier = {
  [PERSON_OBJECT_UNIVERSAL_IDENTIFIER]: 'People',
  [COMPANY_OBJECT_UNIVERSAL_IDENTIFIER]: 'Companies',
  [TASK_OBJECT_UNIVERSAL_IDENTIFIER]: 'Tasks',
};

const getLabels = (
  role: RoleManifest,
  options?: Parameters<typeof buildPermissionSummaryFromRoleManifest>[1],
) =>
  buildPermissionSummaryFromRoleManifest(role, options).map(
    ({ label }) => label,
  );

describe('buildPermissionSummaryFromRoleManifest', () => {
  it('returns nothing for a role without permissions', () => {
    expect(buildPermissionSummaryFromRoleManifest(baseRole)).toEqual([]);
  });

  describe('all-record permissions', () => {
    it.each([
      [{ canReadAllObjectRecords: true }, 'Read all records'],
      [{ canUpdateAllObjectRecords: true }, 'Write all records'],
      [{ canSoftDeleteAllObjectRecords: true }, 'Delete all records'],
      [{ canDestroyAllObjectRecords: true }, 'Delete all records'],
      [
        { canReadAllObjectRecords: true, canUpdateAllObjectRecords: true },
        'Read and write all records',
      ],
      [
        { canReadAllObjectRecords: true, canSoftDeleteAllObjectRecords: true },
        'Read and delete all records',
      ],
      [
        {
          canUpdateAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        },
        'Write and delete all records',
      ],
      [
        {
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
        },
        'Read, write, and delete all records',
      ],
    ])('summarizes %o as "%s"', (permissions, expectedLabel) => {
      expect(getLabels({ ...baseRole, ...permissions })).toEqual([
        expectedLabel,
      ]);
    });

    it('lists object-level grants that go beyond the all-record access', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            canReadAllObjectRecords: true,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-2',
                objectUniversalIdentifier: TASK_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canDestroyObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Read all records', 'Write People', 'Delete Tasks']);
    });

    it('does not repeat object-level grants already covered by the all-record access', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: true,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Read and write all records']);
    });
  });

  describe('object-level permissions', () => {
    it('names the objects and groups them by access level', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-2',
                objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-3',
                objectUniversalIdentifier: TASK_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Read and write People and Companies', 'Read Tasks']);
    });

    it('counts objects whose label is unknown instead of hiding them', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-2',
                objectUniversalIdentifier: 'unknown-object-1',
                canReadObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-3',
                objectUniversalIdentifier: 'unknown-object-2',
                canReadObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Read People and 2 other objects']);
    });

    it('does not resolve object labels from Object prototype properties', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-2',
                objectUniversalIdentifier: 'constructor',
                canReadObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-3',
                objectUniversalIdentifier: 'hasOwnProperty',
                canReadObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Read People and 2 other objects']);
    });

    it('falls back to a count when no labels are provided at all', () => {
      expect(
        getLabels({
          ...baseRole,
          objectPermissions: [
            {
              universalIdentifier: 'perm-1',
              objectUniversalIdentifier: 'obj-1',
              canReadObjectRecords: true,
              canSoftDeleteObjectRecords: true,
            },
          ],
        }),
      ).toEqual(['Read and delete 1 other object']);
    });

    it('skips object permissions that grant nothing and deduplicates objects', () => {
      expect(
        getLabels(
          {
            ...baseRole,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: false,
                canUpdateObjectRecords: false,
              },
              {
                universalIdentifier: 'perm-2',
                objectUniversalIdentifier: TASK_OBJECT_UNIVERSAL_IDENTIFIER,
                canDestroyObjectRecords: true,
              },
              {
                universalIdentifier: 'perm-3',
                objectUniversalIdentifier: TASK_OBJECT_UNIVERSAL_IDENTIFIER,
                canDestroyObjectRecords: true,
              },
            ],
          },
          { objectLabelsByUniversalIdentifier },
        ),
      ).toEqual(['Delete Tasks']);
    });
  });

  describe('permission flags', () => {
    it('labels every system permission flag', () => {
      const labels = getLabels({
        ...baseRole,
        permissionFlagUniversalIdentifiers: Object.values(SystemPermissionFlag),
      });

      expect(labels).toHaveLength(Object.values(SystemPermissionFlag).length);
      expect(new Set(labels).size).toBe(labels.length);
      expect(labels).toEqual(
        expect.arrayContaining([
          'Upload files',
          'Install and manage applications',
          'Run AI agents',
          'Manage billing',
          'Manage MCP, API keys, and webhooks',
        ]),
      );
    });

    it('deduplicates repeated flags and ignores unknown ones', () => {
      expect(
        getLabels({
          ...baseRole,
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.WORKFLOWS,
            SystemPermissionFlag.WORKFLOWS,
            'unknown-flag-00000000-0000-0000-0000-000000000000',
          ],
        }),
      ).toEqual(['Manage workflows']);
    });

    it('ignores identifiers that name Object prototype properties', () => {
      expect(
        getLabels({
          ...baseRole,
          permissionFlagUniversalIdentifiers: [
            'constructor',
            'toString',
            '__proto__',
            SystemPermissionFlag.WORKFLOWS,
          ],
        }),
      ).toEqual(['Manage workflows']);
    });
  });

  describe('ordering', () => {
    it('lists records, data model, settings, tools, then other flags', () => {
      expect(
        getLabels({
          ...baseRole,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canUpdateAllSettings: true,
          canAccessAllTools: true,
          permissionFlagUniversalIdentifiers: [
            SystemPermissionFlag.WORKFLOWS,
            SystemPermissionFlag.DATA_MODEL,
          ],
        }),
      ).toEqual([
        'Read and write all records',
        'Read and write data model configuration',
        'Update all workspace settings',
        'Use all tools',
        'Manage workflows',
      ]);
    });

    it('treats explicit false values as no permission', () => {
      expect(
        getLabels({
          ...baseRole,
          canReadAllObjectRecords: false,
          canUpdateAllObjectRecords: false,
          canSoftDeleteAllObjectRecords: false,
          canDestroyAllObjectRecords: false,
          canUpdateAllSettings: false,
          canAccessAllTools: false,
          objectPermissions: [],
          permissionFlagUniversalIdentifiers: [],
        }),
      ).toEqual([]);
    });
  });
});
