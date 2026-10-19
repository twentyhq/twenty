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
const APP_OBJECT_UNIVERSAL_IDENTIFIER = 'a1b2c3d4-0000-4000-8000-0000000000a1';

const objectLabelsByUniversalIdentifier = {
  [PERSON_OBJECT_UNIVERSAL_IDENTIFIER]: 'Person',
  [COMPANY_OBJECT_UNIVERSAL_IDENTIFIER]: 'Company',
  [TASK_OBJECT_UNIVERSAL_IDENTIFIER]: 'Task',
};

const getLabels = (
  role: RoleManifest,
  options?: Parameters<typeof buildPermissionSummaryFromRoleManifest>[1],
) =>
  buildPermissionSummaryFromRoleManifest(role, options).map(
    ({ label }) => label,
  );

const getDetails = (
  role: RoleManifest,
  options?: Parameters<typeof buildPermissionSummaryFromRoleManifest>[1],
) =>
  buildPermissionSummaryFromRoleManifest(role, options).map(
    ({ details }) => details?.items,
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
      ).toEqual(['Read all records', 'Write 1 object', 'Delete 1 object']);
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
    it('counts the objects and groups them by access level', () => {
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
      ).toEqual(['Read and write 2 objects', 'Read 1 object']);
    });

    it('counts objects whose label is unknown too', () => {
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
      ).toEqual(['Read 3 objects']);
    });

    it('does not resolve object labels from Object prototype properties', () => {
      expect(
        getDetails(
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
      ).toEqual([['Person', '2 other objects']]);
    });

    it('lists the singular labels of the resolved objects as details', () => {
      const [item] = buildPermissionSummaryFromRoleManifest(
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
              objectUniversalIdentifier: COMPANY_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
            {
              universalIdentifier: 'perm-3',
              objectUniversalIdentifier: 'unknown-object-1',
              canReadObjectRecords: true,
            },
          ],
        },
        { objectLabelsByUniversalIdentifier },
      );

      expect(item.label).toBe('Read 3 objects');
      expect(item.details).toEqual({
        title: 'Read 3 object records:',
        items: ['Person', 'Company', '1 other object'],
      });
    });

    it('has no details when no object label is resolved', () => {
      const [item] = buildPermissionSummaryFromRoleManifest({
        ...baseRole,
        objectPermissions: [
          {
            universalIdentifier: 'perm-1',
            objectUniversalIdentifier: 'unknown-object-1',
            canReadObjectRecords: true,
          },
        ],
      });

      expect(item.label).toBe('Read 1 object');
      expect(item.details).toBeUndefined();
    });

    it('leaves out grants on objects the application defines itself', () => {
      const [item, ...otherItems] = buildPermissionSummaryFromRoleManifest(
        {
          ...baseRole,
          objectPermissions: [
            {
              universalIdentifier: 'perm-1',
              objectUniversalIdentifier: APP_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
              canUpdateObjectRecords: true,
              canDestroyObjectRecords: true,
            },
            {
              universalIdentifier: 'perm-2',
              objectUniversalIdentifier: PERSON_OBJECT_UNIVERSAL_IDENTIFIER,
              canReadObjectRecords: true,
            },
          ],
        },
        {
          objectLabelsByUniversalIdentifier,
          appObjectUniversalIdentifiers: new Set([
            APP_OBJECT_UNIVERSAL_IDENTIFIER,
          ]),
        },
      );

      expect(otherItems).toEqual([]);
      expect(item.label).toBe('Read 1 object');
      expect(item.details).toEqual({
        title: 'Read 1 object record:',
        items: ['Person'],
      });
    });

    it('requests nothing when the role only grants access to its own objects', () => {
      expect(
        buildPermissionSummaryFromRoleManifest(
          {
            ...baseRole,
            objectPermissions: [
              {
                universalIdentifier: 'perm-1',
                objectUniversalIdentifier: APP_OBJECT_UNIVERSAL_IDENTIFIER,
                canReadObjectRecords: true,
                canUpdateObjectRecords: true,
              },
            ],
          },
          {
            appObjectUniversalIdentifiers: new Set([
              APP_OBJECT_UNIVERSAL_IDENTIFIER,
            ]),
          },
        ),
      ).toEqual([]);
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
      ).toEqual(['Read and delete 1 object']);
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
      ).toEqual(['Delete 1 object']);
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
