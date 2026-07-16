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
