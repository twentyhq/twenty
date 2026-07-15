import { describe, expect, it } from 'vitest';

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

interface RoleDefinition {
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
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  config: RoleDefinition;
}

const FIREWALL_FLAG_UIDS = [
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
];

const UI_FOR_ROLE = {
  researcher: RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
  partner: PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
  finance: FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
  compliance: COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
} as const;

async function validateRoleImport(
  importPath: string,
  expectedUniversalIdentifier: string,
  expectedFlagUids: string[],
) {
  const mod = await import(importPath);
  const result = mod.default as ValidationResult;
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
      UI_FOR_ROLE.researcher,
      [],
    );
  });

  it('does not contain any firewall permission flag UIDs', async () => {
    const mod = await import('src/roles/researcher.role');
    const result = mod.default as ValidationResult;
    const roleUids = result.config.permissionFlagUniversalIdentifiers;
    for (const flagUid of FIREWALL_FLAG_UIDS) {
      expect(roleUids).not.toContain(flagUid);
    }
  });
});

describe('partner role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/partner.role',
      UI_FOR_ROLE.partner,
      [],
    );
  });

  it('does not contain any firewall permission flag UIDs', async () => {
    const mod = await import('src/roles/partner.role');
    const result = mod.default as ValidationResult;
    const roleUids = result.config.permissionFlagUniversalIdentifiers;
    for (const flagUid of FIREWALL_FLAG_UIDS) {
      expect(roleUids).not.toContain(flagUid);
    }
  });
});

describe('finance role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/finance.role',
      UI_FOR_ROLE.finance,
      [CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER],
    );
  });
});

describe('compliance role', () => {
  it('validates without errors and has expected config', async () => {
    await validateRoleImport(
      'src/roles/compliance.role',
      UI_FOR_ROLE.compliance,
      [
        CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
        CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      ],
    );
  });
});

describe('default role', () => {
  it('has empty permissionFlagUniversalIdentifiers', async () => {
    const mod = await import('src/default-role');
    const result = mod.default as ValidationResult;
    expect(result.config.permissionFlagUniversalIdentifiers).toEqual([]);
  });

  it('does not contain any firewall permission flag UIDs', async () => {
    const mod = await import('src/default-role');
    const result = mod.default as ValidationResult;
    const roleUids = result.config.permissionFlagUniversalIdentifiers;
    for (const flagUid of FIREWALL_FLAG_UIDS) {
      expect(roleUids).not.toContain(flagUid);
    }
  });
});
