import { afterEach, describe, expect, it, vi } from 'vitest';

import { PDL_PERSON_REQUIRED_FIELD_OPTIONS } from 'src/constants/pdl-person-required-field-options';
import { PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME } from 'src/constants/pdl-person-required-fields-env-var-name';
import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { resolveRequiredFields } from 'src/logic-functions/utils/resolve-required-fields';

const CONFIGURATION = {
  envVarName: PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME,
  options: PDL_PERSON_REQUIRED_FIELD_OPTIONS,
};

describe('resolveRequiredFields', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([undefined, '', '[]'])(
    'requires no fields by default (%s)',
    (value) => {
      vi.stubEnv(PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME, value);

      expect(resolveRequiredFields(CONFIGURATION)).toBeUndefined();
    },
  );

  it('requires every selected app field', () => {
    vi.stubEnv(
      PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME,
      JSON.stringify(['work_email', 'job_title']),
    );

    expect(resolveRequiredFields(CONFIGURATION)).toBe(
      'work_email AND job_title',
    );
  });

  it('uses the workflow selection instead of the app setting', () => {
    vi.stubEnv(PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME, 'invalid');

    expect(
      resolveRequiredFields({
        ...CONFIGURATION,
        requiredFields: ['phone_numbers', 'phone_numbers'],
      }),
    ).toBe('phone_numbers');
  });

  it('allows a workflow to clear the app requirements', () => {
    vi.stubEnv(PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME, '["work_email"]');

    expect(
      resolveRequiredFields({ ...CONFIGURATION, requiredFields: [] }),
    ).toBeUndefined();
  });

  it.each(['invalid', '{}', '["unknown_field"]', '[1]'])(
    'rejects an invalid app setting (%s)',
    (value) => {
      vi.stubEnv(PDL_PERSON_REQUIRED_FIELDS_ENV_VAR_NAME, value);

      expect(() => resolveRequiredFields(CONFIGURATION)).toThrow(
        PdlConfigError,
      );
    },
  );

  it('rejects unsupported workflow fields', () => {
    expect(() =>
      resolveRequiredFields({
        ...CONFIGURATION,
        requiredFields: ['work_email OR job_title'],
      }),
    ).toThrow(PdlInvalidInputError);
  });
});
