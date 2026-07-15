import { beforeAll, describe, expect, it } from 'vitest';

import {
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
} from 'src/constants/permission-flag-universal-identifiers';
import {
  COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
  FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
  PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/role-universal-identifiers';

import type { ValidationResult } from 'src/__tests__/test-helpers';

type RoleDefinition = {
  universalIdentifier: string;
  label: string;
  description: string;
  canReadAllObjectRecords: boolean;
  canUpdateAllObjectRecords: boolean;
  canSoftDeleteAllObjectRecords: boolean;
  canDestroyAllObjectRecords: boolean;
  canUpdateAllSettings: boolean;
  canBeAssignedToUsers: boolean;
  canBeAssignedToAgents: boolean;
  canBeAssignedToApiKeys: boolean;
  objectPermissions: unknown[];
  fieldPermissions: unknown[];
  permissionFlagUniversalIdentifiers: string[];
};

const FIREWALL_FLAG_UIDS = [
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
];

async function validateRoleImport(
  importPath: string,
  expectedUniversalIdentifier: string,
  expectedFlagUids: string[],
) {
  const mod = await import(importPath);
  const result = mod.default as ValidationResult<RoleDefinition>;
  expect(result.success, result.errors.join('; ')).toBe(true);
  expect(result.errors).toEqual([]);
  expect(result.config.universalIdentifier).toBe(expectedUniversalIdentifier);
  expect(result.config.objectPermissions).toEqual([]);
  expect(result.config.fieldPermissions).toEqual([]);
  expect(result.config.permissionFlagUniversalIdentifiers).toEqual(
    expectedFlagUids,
  );
}

describe('researcher role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/researcher.role',
      RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
      [],
    );
  });
});

describe('partner role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/partner.role',
      PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
      [],
    );
  });
});

describe('finance role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/finance.role',
      FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
      [CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER],
    );
  });
});

describe('compliance role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/compliance.role',
      COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
      [
        CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
        CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      ],
    );
  });
});

describe.each([
  ['researcher', 'src/roles/researcher.role'],
  ['partner', 'src/roles/partner.role'],
])('%s role does not contain firewall permission flag UIDs', (_, importPath) => {
  it('has no firewall flags', async () => {
    const mod = await import(importPath);
    const result = mod.default as ValidationResult<RoleDefinition>;
    const roleUids = result.config.permissionFlagUniversalIdentifiers;
    for (const flagUid of FIREWALL_FLAG_UIDS) {
      expect(roleUids).not.toContain(flagUid);
    }
  });
});

describe('default role', () => {
  let result: ValidationResult<RoleDefinition>;

  beforeAll(async () => {
    const mod = await import('src/default-role');
    result = mod.default as ValidationResult<RoleDefinition>;
  });

  it('has empty permissionFlagUniversalIdentifiers', () => {
    expect(result.config.permissionFlagUniversalIdentifiers).toEqual([]);
  });

  it('does not contain any firewall permission flag UIDs', () => {
    const roleUids = result.config.permissionFlagUniversalIdentifiers;
    for (const flagUid of FIREWALL_FLAG_UIDS) {
      expect(roleUids).not.toContain(flagUid);
    }
  });
});
