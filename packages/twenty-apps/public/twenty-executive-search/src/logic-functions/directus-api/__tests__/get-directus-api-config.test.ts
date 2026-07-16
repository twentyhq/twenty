import { describe, expect, it, beforeEach, afterEach } from 'vitest';

import { getDirectusApiConfig } from 'src/logic-functions/directus-api/get-directus-api-config.util';

import {
  DIRECTUS_API_KEY_ENV_VAR_NAME,
  DIRECTUS_URL_ENV_VAR_NAME,
} from 'src/constants/server-variable-names';

describe('getDirectusApiConfig', () => {
  beforeEach(() => {
    delete process.env[DIRECTUS_URL_ENV_VAR_NAME];
    delete process.env[DIRECTUS_API_KEY_ENV_VAR_NAME];
  });

  afterEach(() => {
    delete process.env[DIRECTUS_URL_ENV_VAR_NAME];
    delete process.env[DIRECTUS_API_KEY_ENV_VAR_NAME];
  });

  it('returns success:true when both URL and API key are set', () => {
    process.env[DIRECTUS_URL_ENV_VAR_NAME] =
      'https://directus.firm.example';
    process.env[DIRECTUS_API_KEY_ENV_VAR_NAME] = 'directus-api-key';

    const result = getDirectusApiConfig();

    expect(result).toEqual({
      success: true,
      config: {
        url: 'https://directus.firm.example',
        apiKey: 'directus-api-key',
      },
    });
  });

  it('returns success:false when DIRECTUS_URL is not set', () => {
    process.env[DIRECTUS_API_KEY_ENV_VAR_NAME] = 'directus-api-key';

    const result = getDirectusApiConfig();

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.reason).toContain('DIRECTUS_URL');
    }
  });

  it('returns success:false when DIRECTUS_API_KEY is not set', () => {
    process.env[DIRECTUS_URL_ENV_VAR_NAME] =
      'https://directus.firm.example';

    const result = getDirectusApiConfig();

    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.reason).toContain('DIRECTUS_API_KEY');
    }
  });

  it('returns success:false when both are not set', () => {
    const result = getDirectusApiConfig();

    expect(result.success).toBe(false);
  });

  it('strips trailing slashes from the URL', () => {
    process.env[DIRECTUS_URL_ENV_VAR_NAME] =
      'https://directus.firm.example///';
    process.env[DIRECTUS_API_KEY_ENV_VAR_NAME] = 'directus-api-key';

    const result = getDirectusApiConfig();

    expect(result).toEqual({
      success: true,
      config: {
        url: 'https://directus.firm.example',
        apiKey: 'directus-api-key',
      },
    });
  });

  it('trims whitespace from URL and API key', () => {
    process.env[DIRECTUS_URL_ENV_VAR_NAME] =
      '  https://directus.firm.example  ';
    process.env[DIRECTUS_API_KEY_ENV_VAR_NAME] = '  directus-api-key  ';

    const result = getDirectusApiConfig();

    expect(result).toEqual({
      success: true,
      config: {
        url: 'https://directus.firm.example',
        apiKey: 'directus-api-key',
      },
    });
  });
});