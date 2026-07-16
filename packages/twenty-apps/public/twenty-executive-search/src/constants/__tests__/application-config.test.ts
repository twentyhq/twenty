import { describe, expect, it } from 'vitest';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/application-universal-identifier';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/constants/default-role-universal-identifier';
import { APP_DISPLAY_NAME } from 'src/constants/app-display-name';
import {
  DIRECTUS_API_KEY_ENV_VAR_NAME,
  DIRECTUS_URL_ENV_VAR_NAME,
} from 'src/constants/server-variable-names';

describe('executive-search app constants', () => {
  it('has stable application universal identifier', () => {
    expect(APPLICATION_UNIVERSAL_IDENTIFIER).toBe('b64e7e15-e7bf-468e-8bfb-83a4d92ea966');
  });

  it('has stable default role universal identifier', () => {
    expect(DEFAULT_ROLE_UNIVERSAL_IDENTIFIER).toBe(
      'd908b08c-fd00-40be-9824-0e47ddf066fe',
    );
  });

  it('has display name', () => {
    expect(APP_DISPLAY_NAME).toBe('Executive Search');
  });

  it('server variable names are defined', () => {
    expect(DIRECTUS_URL_ENV_VAR_NAME).toBe('DIRECTUS_URL');
    expect(DIRECTUS_API_KEY_ENV_VAR_NAME).toBe('DIRECTUS_API_KEY');
  });
});

describe('application-config validation', () => {
  it('app definition validates without errors', async () => {
    const mod = await import('src/application-config');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe('b64e7e15-e7bf-468e-8bfb-83a4d92ea966');
  });

  it('default role validates without errors', async () => {
    const mod = await import('src/default-role');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      'd908b08c-fd00-40be-9824-0e47ddf066fe',
    );
    expect(result.config.canReadAllObjectRecords).toBe(false);
    const perms = result.config.objectPermissions!;
    expect(perms.length).toBe(1);
    expect(perms[0].canReadObjectRecords).toBe(true);
    expect(perms[0].canUpdateObjectRecords).toBe(true);
    expect(perms[0].canSoftDeleteObjectRecords).toBe(false);
    expect(perms[0].canDestroyObjectRecords).toBe(false);
  });
});

import { UUID_V4_REGEX } from 'src/__tests__/test-helpers';

describe('role universal identifiers', () => {
  it('all role UIDs are valid UUID v4', async () => {
    const {
      RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
      PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
      FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
      COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
    } = await import('src/constants/role-universal-identifiers');

    expect(RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER).toMatch(UUID_V4_REGEX);
    expect(PARTNER_ROLE_UNIVERSAL_IDENTIFIER).toMatch(UUID_V4_REGEX);
    expect(FINANCE_ROLE_UNIVERSAL_IDENTIFIER).toMatch(UUID_V4_REGEX);
    expect(COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER).toMatch(UUID_V4_REGEX);
  });

  it('all role UIDs are unique', async () => {
    const {
      RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
      PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
      FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
      COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
    } = await import('src/constants/role-universal-identifiers');

    const uids = [
      RESEARCHER_ROLE_UNIVERSAL_IDENTIFIER,
      PARTNER_ROLE_UNIVERSAL_IDENTIFIER,
      FINANCE_ROLE_UNIVERSAL_IDENTIFIER,
      COMPLIANCE_ROLE_UNIVERSAL_IDENTIFIER,
    ];
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length);
  });

  it('role UIDs do not collide with permission flag UIDs', async () => {
    const roleIds = await import('src/constants/role-universal-identifiers');
    const flagIds = await import(
      'src/constants/permission-flag-universal-identifiers'
    );

    const roleUids = Object.values(roleIds);
    const flagUids = Object.values(flagIds);
    const allUids = [...roleUids, ...flagUids];
    const uniqueUids = new Set(allUids);
    expect(uniqueUids.size).toBe(allUids.length);
  });

  it('role UIDs do not collide with existing slugs', async () => {
    const roleIds = await import('src/constants/role-universal-identifiers');
    const roleUids = Object.values(roleIds);

    const existingAppAndRoleUids = [
      APPLICATION_UNIVERSAL_IDENTIFIER,
      DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
    ];

    for (const uid of roleUids) {
      expect(existingAppAndRoleUids).not.toContain(uid);
    }
  });
});

describe('permission flag universal identifiers', () => {
  it('all permission flag UIDs are valid UUID v4', async () => {
    const {
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    } = await import(
      'src/constants/permission-flag-universal-identifiers'
    );

    expect(
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
    expect(
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
    expect(
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ).toMatch(UUID_V4_REGEX);
  });

  it('all permission flag UIDs are unique', async () => {
    const {
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    } = await import(
      'src/constants/permission-flag-universal-identifiers'
    );

    const uids = [
      CAN_BYPASS_COMMERCIAL_FIREWALL_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_VIEW_COMMERCIAL_DATA_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
      CAN_ACCESS_RESTRICTED_DEMOGRAPHICS_PERMISSION_FLAG_UNIVERSAL_IDENTIFIER,
    ];
    const uniqueUids = new Set(uids);
    expect(uniqueUids.size).toBe(uids.length);
  });

  it('permission flag UIDs do not collide with existing slugs', async () => {
    const flagIds = await import(
      'src/constants/permission-flag-universal-identifiers'
    );
    const flagUids = Object.values(flagIds);

    const existingAppAndRoleUids = [
      APPLICATION_UNIVERSAL_IDENTIFIER,
      DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
    ];

    for (const uid of flagUids) {
      expect(existingAppAndRoleUids).not.toContain(uid);
    }
  });
});
