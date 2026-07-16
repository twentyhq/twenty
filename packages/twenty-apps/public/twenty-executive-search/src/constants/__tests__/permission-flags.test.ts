import { describe, expect, it } from 'vitest';

import {
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
} from 'src/constants/permission-flag-universal-identifiers';

import {
  UUID_V4_REGEX,
  type ValidationResult,
} from 'src/__tests__/test-helpers';

type PermissionFlagConfig = {
  key: string;
  label: string;
  universalIdentifier: string;
};

describe('permission-flag-universal-identifiers', () => {
  it('CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER is a valid UUID v4', () => {
    expect(
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
  });

  it('CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER is a valid UUID v4', () => {
    expect(
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
  });

  it('CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER is a valid UUID v4', () => {
    expect(
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
  });

  it('all 3 UIDs are unique', () => {
    const uids = [
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ];
    expect(new Set(uids).size).toBe(uids.length);
  });
});

describe.each([
  {
    name: 'can-bypass-commercial-firewall',
    importPath:
      'src/permission-flags/can-bypass-commercial-firewall.permission-flag',
    key: 'CAN_BYPASS_COMMERCIAL_FIREWALL',
    label: 'Bypass Commercial Firewall',
    uid: CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  },
  {
    name: 'can-view-commercial-data',
    importPath:
      'src/permission-flags/can-view-commercial-data.permission-flag',
    key: 'CAN_VIEW_COMMERCIAL_DATA',
    label: 'View Commercial Data',
    uid: CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  },
  {
    name: 'can-access-restricted-demographics',
    importPath:
      'src/permission-flags/can-access-restricted-demographics.permission-flag',
    key: 'CAN_ACCESS_RESTRICTED_DEMOGRAPHICS',
    label: 'Access Restricted Demographics',
    uid: CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  },
])('$name permission flag', ({ importPath, key, label, uid }) => {
  it('validates without errors and has expected config', async () => {
    const mod = await import(importPath);
    const result = mod.default as ValidationResult<PermissionFlagConfig>;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.key).toBe(key);
    expect(result.config.label).toBe(label);
    expect(result.config.universalIdentifier).toBe(uid);
  });
});
