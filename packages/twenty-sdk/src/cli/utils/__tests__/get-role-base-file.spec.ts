import { getRoleBaseFile } from '@/cli/utils/get-role-base-file';

describe('getRoleBaseFile', () => {
  it('should render proper file using defineRole', () => {
    const result = getRoleBaseFile({
      name: 'my-role',
      universalIdentifier: '71e45a58-41da-4ae4-8b73-a543c0a9d3d4',
    });

    // Verify it uses defineRole
    expect(result).toContain("import { defineRole } from 'twenty-sdk'");
    expect(result).toContain('export default defineRole({');

    // Verify role properties
    expect(result).toContain(
      "universalIdentifier: MY_ROLE_ROLE_UNIVERSAL_IDENTIFIER",
    );
    expect(result).toContain(
      "'71e45a58-41da-4ae4-8b73-a543c0a9d3d4'",
    );
    expect(result).toContain("label: 'my-role'");
    expect(result).toContain("description: 'Add a description for your role'");

    // Verify permission defaults
    expect(result).toContain('canReadAllObjectRecords: true');
    expect(result).toContain('canUpdateAllObjectRecords: true');
    expect(result).toContain('canSoftDeleteAllObjectRecords: true');
    expect(result).toContain('canDestroyAllObjectRecords: false');
  });

  it('should generate unique UUID when not provided', () => {
    const result = getRoleBaseFile({
      name: 'auto-uuid-role',
    });

    // Verify it has a universalIdentifier (UUID format)
    expect(result).toMatch(
      /'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'/,
    );
  });

  it('should use kebab-case for role name in label', () => {
    const result = getRoleBaseFile({
      name: 'my-awesome-role',
    });

    expect(result).toContain("label: 'my-awesome-role'");
  });

  it('should export universal identifier constant with correct naming', () => {
    const result = getRoleBaseFile({
      name: 'admin-access',
    });

    expect(result).toContain('export const ADMIN_ACCESS_ROLE_UNIVERSAL_IDENTIFIER');
    expect(result).toContain(
      'universalIdentifier: ADMIN_ACCESS_ROLE_UNIVERSAL_IDENTIFIER',
    );
  });

  it('should handle names with numbers', () => {
    const result = getRoleBaseFile({
      name: 'role-v2',
    });

    // kebab-case separates numbers with underscore when converted to constant
    expect(result).toContain('export const ROLE_V_2_ROLE_UNIVERSAL_IDENTIFIER');
    expect(result).toContain("label: 'role-v2'");
  });
});
