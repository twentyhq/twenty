import { type RoleManifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';

import { buildPermissionSummaryFromRoleManifest } from '@/marketplace/utils/buildPermissionSummaryFromRoleManifest';

const baseRole: RoleManifest = {
  universalIdentifier: 'test-role',
  label: 'Test Role',
};

describe('buildPermissionSummaryFromRoleManifest', () => {
  it('should return empty array when role has no permissions', () => {
    const result = buildPermissionSummaryFromRoleManifest(baseRole);

    expect(result).toEqual([]);
  });

  describe('record permissions', () => {
    it('should return "Read records" for read-only', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read records');
    });

    it('should return "Write records" for write-only', () => {
      const role: RoleManifest = {
        ...baseRole,
        canUpdateAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Write records');
    });

    it('should return "Read and write records" for read+write', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read and write records');
    });

    it('should return "Delete records" for soft-delete only', () => {
      const role: RoleManifest = {
        ...baseRole,
        canSoftDeleteAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Delete records');
    });

    it('should return "Delete records" for destroy only', () => {
      const role: RoleManifest = {
        ...baseRole,
        canDestroyAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Delete records');
    });

    it('should return "Read and delete records" for read+delete', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read and delete records');
    });

    it('should return "Read, write, and delete records" with Oxford comma for all three', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read, write, and delete records');
    });

    it('should treat destroy the same as soft-delete for label purposes', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result[0].label).toBe('Read, write, and delete records');
    });
  });

  describe('object permissions fallback', () => {
    it('should show "Access specific object records" when objectPermissions exist but no global record flags', () => {
      const role: RoleManifest = {
        ...baseRole,
        objectPermissions: [
          {
            universalIdentifier: 'perm-1',
            objectUniversalIdentifier: 'obj-1',
            canReadObjectRecords: true,
          },
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Access specific object records');
    });

    it('should not show object permissions fallback when global record flags are set', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        objectPermissions: [
          {
            universalIdentifier: 'perm-1',
            objectUniversalIdentifier: 'obj-1',
            canReadObjectRecords: true,
          },
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read records');
    });
  });

  describe('permission flags', () => {
    it('should add DATA_MODEL flag as "Read and write data model configuration"', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.DATA_MODEL],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Read and write data model configuration');
    });

    it('should add WORKFLOWS flag', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.WORKFLOWS],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Manage workflows');
    });

    it('should add SECURITY flag', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.SECURITY],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Manage security settings');
    });

    it('should add WORKSPACE_MEMBERS flag', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.WORKSPACE_MEMBERS,
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Manage workspace members');
    });

    it('should add BILLING flag', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [SystemPermissionFlag.BILLING],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Manage billing');
    });

    it('should add API_KEYS_AND_WEBHOOKS flag', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.API_KEYS_AND_WEBHOOKS,
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Manage API keys and webhooks');
    });

    it('should ignore unknown permission flags', () => {
      const role: RoleManifest = {
        ...baseRole,
        permissionFlagUniversalIdentifiers: [
          'unknown-flag-00000000-0000-0000-0000-000000000000',
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toEqual([]);
    });
  });

  describe('settings and tools', () => {
    it('should add "Update workspace settings" when canUpdateAllSettings is true', () => {
      const role: RoleManifest = {
        ...baseRole,
        canUpdateAllSettings: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Update workspace settings');
    });

    it('should add "Access all tools" when canAccessAllTools is true', () => {
      const role: RoleManifest = {
        ...baseRole,
        canAccessAllTools: true,
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe('Access all tools');
    });
  });

  describe('combined permissions', () => {
    it('should combine all permission types in correct order', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canUpdateAllSettings: true,
        canAccessAllTools: true,
        permissionFlagUniversalIdentifiers: [
          SystemPermissionFlag.DATA_MODEL,
          SystemPermissionFlag.WORKFLOWS,
        ],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result.map((item) => item.label)).toEqual([
        'Read and write records',
        'Read and write data model configuration',
        'Update workspace settings',
        'Access all tools',
        'Manage workflows',
      ]);
    });

    it('should handle a role with only undefined/false permission values', () => {
      const role: RoleManifest = {
        ...baseRole,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        objectPermissions: [],
        permissionFlagUniversalIdentifiers: [],
      };

      const result = buildPermissionSummaryFromRoleManifest(role);

      expect(result).toEqual([]);
    });
  });
});
