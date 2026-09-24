import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-min-likelihood-env-var-name';
import { PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-weak-identifier-min-likelihood-env-var-name';
import { PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-min-likelihood-env-var-name';
import { PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-weak-identifier-min-likelihood-env-var-name';
import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { resolveMinLikelihoods } from 'src/logic-functions/utils/resolve-min-likelihoods';

const PERSON_ENV_VAR_NAMES = {
  minLikelihoodEnvVarName: PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME,
  weakIdentifierMinLikelihoodEnvVarName:
    PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
};

const COMPANY_ENV_VAR_NAMES = {
  minLikelihoodEnvVarName: PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME,
  weakIdentifierMinLikelihoodEnvVarName:
    PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
};

const INVALID_CONFIGURED_VALUES = [
  '-1',
  '0',
  '11',
  '1.5',
  'NaN',
  'Infinity',
  '7invalid',
];

const INVALID_INPUT_VALUES = [-1, 0, 11, 1.5, NaN, Infinity];

const INVALID_SETTING_ERROR = new PdlConfigError(
  'Each minimum likelihood setting must be an integer between 1 and 10.',
);

describe('resolveMinLikelihoods', () => {
  beforeEach(() => {
    for (const envVarName of [
      PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME,
      PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
      PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME,
      PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
    ]) {
      vi.stubEnv(envVarName, undefined);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe.each([
    { objectName: 'people', envVarNames: PERSON_ENV_VAR_NAMES },
    { objectName: 'companies', envVarNames: COMPANY_ENV_VAR_NAMES },
  ])('settings for $objectName', ({ envVarNames }) => {
    const { minLikelihoodEnvVarName, weakIdentifierMinLikelihoodEnvVarName } =
      envVarNames;

    it.each([undefined, '', '   '])(
      'uses the default likelihoods when the settings are %j',
      (configuredValue) => {
        vi.stubEnv(minLikelihoodEnvVarName, configuredValue);
        vi.stubEnv(weakIdentifierMinLikelihoodEnvVarName, configuredValue);

        expect(resolveMinLikelihoods({ input: {}, ...envVarNames })).toEqual({
          strongIdentifierMinLikelihood: 2,
          weakIdentifierMinLikelihood: 6,
        });
      },
    );

    it.each([
      { configuredValue: '1', weakIdentifierMinLikelihood: 6 },
      { configuredValue: '7', weakIdentifierMinLikelihood: 7 },
      { configuredValue: '10', weakIdentifierMinLikelihood: 10 },
      { configuredValue: ' 7 ', weakIdentifierMinLikelihood: 7 },
    ])(
      'uses a configured minimum of $configuredValue with the name-based setting as a floor',
      ({ configuredValue, weakIdentifierMinLikelihood }) => {
        vi.stubEnv(minLikelihoodEnvVarName, configuredValue);

        expect(resolveMinLikelihoods({ input: {}, ...envVarNames })).toEqual({
          strongIdentifierMinLikelihood: Number(configuredValue),
          weakIdentifierMinLikelihood,
        });
      },
    );

    it.each(INVALID_CONFIGURED_VALUES)(
      'rejects a configured minimum of %j',
      (configuredValue) => {
        vi.stubEnv(minLikelihoodEnvVarName, configuredValue);

        expect(() =>
          resolveMinLikelihoods({ input: {}, ...envVarNames }),
        ).toThrow(INVALID_SETTING_ERROR);
      },
    );

    it.each(INVALID_CONFIGURED_VALUES)(
      'rejects a configured name-based minimum of %j',
      (configuredValue) => {
        vi.stubEnv(weakIdentifierMinLikelihoodEnvVarName, configuredValue);

        expect(() =>
          resolveMinLikelihoods({ input: {}, ...envVarNames }),
        ).toThrow(INVALID_SETTING_ERROR);
      },
    );
  });

  it.each([
    {
      configuredValue: '2',
      configuredWeakValue: '3',
      weakIdentifierMinLikelihood: 3,
    },
    {
      configuredValue: '2',
      configuredWeakValue: '9',
      weakIdentifierMinLikelihood: 9,
    },
    {
      configuredValue: '8',
      configuredWeakValue: '3',
      weakIdentifierMinLikelihood: 8,
    },
  ])(
    'uses $weakIdentifierMinLikelihood for name-based matches with settings $configuredValue and $configuredWeakValue',
    ({ configuredValue, configuredWeakValue, weakIdentifierMinLikelihood }) => {
      vi.stubEnv(PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME, configuredValue);
      vi.stubEnv(
        PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
        configuredWeakValue,
      );

      expect(
        resolveMinLikelihoods({ input: {}, ...PERSON_ENV_VAR_NAMES }),
      ).toMatchObject({ weakIdentifierMinLikelihood });
    },
  );

  it('reads only the settings it is given', () => {
    vi.stubEnv(PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME, '3');
    vi.stubEnv(PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME, '9');
    vi.stubEnv(PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME, '4');
    vi.stubEnv(PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME, '10');

    expect(
      resolveMinLikelihoods({ input: {}, ...PERSON_ENV_VAR_NAMES }),
    ).toEqual({
      strongIdentifierMinLikelihood: 3,
      weakIdentifierMinLikelihood: 9,
    });
    expect(
      resolveMinLikelihoods({ input: {}, ...COMPANY_ENV_VAR_NAMES }),
    ).toEqual({
      strongIdentifierMinLikelihood: 4,
      weakIdentifierMinLikelihood: 10,
    });
  });

  it.each([
    {
      input: { minLikelihood: 3 },
      expected: {
        strongIdentifierMinLikelihood: 3,
        weakIdentifierMinLikelihood: 3,
      },
    },
    {
      input: { weakIdentifierMinLikelihood: 4 },
      expected: {
        strongIdentifierMinLikelihood: 8,
        weakIdentifierMinLikelihood: 4,
      },
    },
    {
      input: { minLikelihood: 3, weakIdentifierMinLikelihood: 4 },
      expected: {
        strongIdentifierMinLikelihood: 3,
        weakIdentifierMinLikelihood: 4,
      },
    },
    {
      input: { minLikelihood: 9, weakIdentifierMinLikelihood: 4 },
      expected: {
        strongIdentifierMinLikelihood: 9,
        weakIdentifierMinLikelihood: 4,
      },
    },
    {
      input: { minLikelihood: null, weakIdentifierMinLikelihood: null },
      expected: {
        strongIdentifierMinLikelihood: 8,
        weakIdentifierMinLikelihood: 8,
      },
    },
  ])(
    'gives explicit workflow inputs $input precedence over the settings',
    ({ input, expected }) => {
      vi.stubEnv(PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME, '8');
      vi.stubEnv(PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME, '7');

      expect(resolveMinLikelihoods({ input, ...PERSON_ENV_VAR_NAMES })).toEqual(
        expected,
      );
    },
  );

  it.each([1, 6, 10])(
    'uses an explicit minimum of %s without reading invalid settings',
    (minLikelihood) => {
      vi.stubEnv(PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME, 'invalid');
      vi.stubEnv(
        PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME,
        'invalid',
      );

      expect(
        resolveMinLikelihoods({
          input: { minLikelihood },
          ...PERSON_ENV_VAR_NAMES,
        }),
      ).toEqual({
        strongIdentifierMinLikelihood: minLikelihood,
        weakIdentifierMinLikelihood: minLikelihood,
      });
    },
  );

  it.each(INVALID_INPUT_VALUES)(
    'rejects an input minimum of %s',
    (minLikelihood) => {
      expect(() =>
        resolveMinLikelihoods({
          input: { minLikelihood },
          ...PERSON_ENV_VAR_NAMES,
        }),
      ).toThrow(
        new PdlInvalidInputError(
          'Minimum likelihood must be an integer between 1 and 10.',
        ),
      );
    },
  );

  it.each(INVALID_INPUT_VALUES)(
    'rejects an input name-based minimum of %s',
    (weakIdentifierMinLikelihood) => {
      expect(() =>
        resolveMinLikelihoods({
          input: { minLikelihood: 3, weakIdentifierMinLikelihood },
          ...PERSON_ENV_VAR_NAMES,
        }),
      ).toThrow(
        new PdlInvalidInputError(
          'Minimum likelihood for name-based matches must be an integer between 1 and 10.',
        ),
      );
    },
  );
});
