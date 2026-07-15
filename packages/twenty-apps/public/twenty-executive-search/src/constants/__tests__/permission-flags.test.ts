import { describe, expect, it } from 'vitest';

import {
  CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
  CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
} from 'src/constants/permission-flag-universal-identifiers';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface PermissionFlagDefinition {
  key: string;
  label: string;
  universalIdentifier: string;
}

interface ValidationResult {
  success: boolean;
  errors: string[];
  config: PermissionFlagDefinition;
}

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
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length);
  });
});

describe('can-bypass-commercial-firewall permission flag', () => {
  it('validates without errors and has expected config', async () => {
    const mod = await import(
      'src/permission-flags/can-bypass-commercial-firewall.permission-flag'
    );
    const result = mod.default as ValidationResult;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.key).toBe('CAN_BYPASS_COMMERCIAL_FIREWALL');
    expect(result.config.label).toBe('Bypass Commercial Firewall');
    expect(result.config.universalIdentifier).toBe(
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    );
  });
});

describe('can-view-commercial-data permission flag', () => {
  it('validates without errors and has expected config', async () => {
    const mod = await import(
      'src/permission-flags/can-view-commercial-data.permission-flag'
    );
    const result = mod.default as ValidationResult;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.key).toBe('CAN_VIEW_COMMERCIAL_DATA');
    expect(result.config.label).toBe('View Commercial Data');
    expect(result.config.universalIdentifier).toBe(
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    );
  });
});

describe('can-access-restricted-demographics permission flag', () => {
  it('validates without errors and has expected config', async () => {
    const mod = await import(
      'src/permission-flags/can-access-restricted-demographics.permission-flag'
    );
    const result = mod.default as ValidationResult;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.key).toBe('CAN_ACCESS_RESTRICTED_DEMOGRAPHICS');
    expect(result.config.label).toBe('Access Restricted Demographics');
    expect(result.config.universalIdentifier).toBe(
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    );
  });
});
