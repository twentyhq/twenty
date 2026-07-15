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
    expect(APPLICATION_UNIVERSAL_IDENTIFIER).toBe('executive-search');
  });

  it('has stable default role universal identifier', () => {
    expect(DEFAULT_ROLE_UNIVERSAL_IDENTIFIER).toBe(
      'executive-search-default-role',
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
    expect(result.config.universalIdentifier).toBe('executive-search');
  });

  it('default role validates without errors', async () => {
    const mod = await import('src/default-role');
    const result = mod.default;
    expect(result.success, result.errors.join('; ')).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.config.universalIdentifier).toBe(
      'executive-search-default-role',
    );
    expect(result.config.canReadAllObjectRecords).toBe(false);
    const permissions = result.config.objectPermissions;
    expect(permissions).toBeDefined();
    if (permissions) {
      expect(permissions).toHaveLength(1);
      expect(permissions[0].canReadObjectRecords).toBe(true);
      expect(permissions[0].canUpdateObjectRecords).toBe(true);
    }
  });
});
