import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MIN_LIKELIHOOD_SETTINGS } from 'src/constants/min-likelihood-settings';
import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { resolveMinLikelihoods } from 'src/logic-functions/utils/resolve-min-likelihoods';

const PERSON_SETTINGS = MIN_LIKELIHOOD_SETTINGS.person;

const INVALID_CONFIGURED_VALUES = [
  '-1',
  '0',
  '11',
  '1.5',
  'NaN',
  'Infinity',
  '7invalid',
  '0x7',
  '1e1',
  '0b11',
];

const INVALID_INPUT_VALUES = [-1, 0, 11, 1.5, NaN, Infinity];

describe('resolveMinLikelihoods', () => {
  beforeEach(() => {
    for (const minLikelihoodSettings of Object.values(
      MIN_LIKELIHOOD_SETTINGS,
    )) {
      vi.stubEnv(
        minLikelihoodSettings.strongIdentifier.variableName,
        undefined,
      );
      vi.stubEnv(minLikelihoodSettings.weakIdentifier.variableName, undefined);
    }
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe.each([
    {
      objectName: 'people',
      minLikelihoodSettings: MIN_LIKELIHOOD_SETTINGS.person,
    },
    {
      objectName: 'companies',
      minLikelihoodSettings: MIN_LIKELIHOOD_SETTINGS.company,
    },
  ])('settings for $objectName', ({ minLikelihoodSettings }) => {
    const { strongIdentifier, weakIdentifier } = minLikelihoodSettings;

    it.each([undefined, '', '   '])(
      'uses the default likelihoods when the settings are %j',
      (configuredValue) => {
        vi.stubEnv(strongIdentifier.variableName, configuredValue);
        vi.stubEnv(weakIdentifier.variableName, configuredValue);

        expect(
          resolveMinLikelihoods({ input: {}, minLikelihoodSettings }),
        ).toEqual({
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
        vi.stubEnv(strongIdentifier.variableName, configuredValue);

        expect(
          resolveMinLikelihoods({ input: {}, minLikelihoodSettings }),
        ).toEqual({
          strongIdentifierMinLikelihood: Number(configuredValue),
          weakIdentifierMinLikelihood,
        });
      },
    );

    it.each(INVALID_CONFIGURED_VALUES)(
      'rejects a configured minimum of %j',
      (configuredValue) => {
        vi.stubEnv(strongIdentifier.variableName, configuredValue);

        expect(() =>
          resolveMinLikelihoods({ input: {}, minLikelihoodSettings }),
        ).toThrow(
          new PdlConfigError(
            `${strongIdentifier.label} must be an integer between 1 and 10.`,
          ),
        );
      },
    );

    it.each(INVALID_CONFIGURED_VALUES)(
      'rejects a configured name-based minimum of %j',
      (configuredValue) => {
        vi.stubEnv(weakIdentifier.variableName, configuredValue);

        expect(() =>
          resolveMinLikelihoods({ input: {}, minLikelihoodSettings }),
        ).toThrow(
          new PdlConfigError(
            `${weakIdentifier.label} must be an integer between 1 and 10.`,
          ),
        );
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
      vi.stubEnv(
        PERSON_SETTINGS.strongIdentifier.variableName,
        configuredValue,
      );
      vi.stubEnv(
        PERSON_SETTINGS.weakIdentifier.variableName,
        configuredWeakValue,
      );

      expect(
        resolveMinLikelihoods({
          input: {},
          minLikelihoodSettings: PERSON_SETTINGS,
        }),
      ).toMatchObject({ weakIdentifierMinLikelihood });
    },
  );

  it('reads only the settings it is given', () => {
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.person.strongIdentifier.variableName,
      '3',
    );
    vi.stubEnv(MIN_LIKELIHOOD_SETTINGS.person.weakIdentifier.variableName, '9');
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.company.strongIdentifier.variableName,
      '4',
    );
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.company.weakIdentifier.variableName,
      '10',
    );

    expect(
      resolveMinLikelihoods({
        input: {},
        minLikelihoodSettings: MIN_LIKELIHOOD_SETTINGS.person,
      }),
    ).toEqual({
      strongIdentifierMinLikelihood: 3,
      weakIdentifierMinLikelihood: 9,
    });
    expect(
      resolveMinLikelihoods({
        input: {},
        minLikelihoodSettings: MIN_LIKELIHOOD_SETTINGS.company,
      }),
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
      vi.stubEnv(PERSON_SETTINGS.strongIdentifier.variableName, '8');
      vi.stubEnv(PERSON_SETTINGS.weakIdentifier.variableName, '7');

      expect(
        resolveMinLikelihoods({
          input,
          minLikelihoodSettings: PERSON_SETTINGS,
        }),
      ).toEqual(expected);
    },
  );

  it.each([1, 6, 10])(
    'uses an explicit minimum of %s without reading invalid settings',
    (minLikelihood) => {
      vi.stubEnv(PERSON_SETTINGS.strongIdentifier.variableName, 'invalid');
      vi.stubEnv(PERSON_SETTINGS.weakIdentifier.variableName, 'invalid');

      expect(
        resolveMinLikelihoods({
          input: { minLikelihood },
          minLikelihoodSettings: PERSON_SETTINGS,
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
          minLikelihoodSettings: PERSON_SETTINGS,
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
          minLikelihoodSettings: PERSON_SETTINGS,
        }),
      ).toThrow(
        new PdlInvalidInputError(
          'Minimum likelihood for name-based matches must be an integer between 1 and 10.',
        ),
      );
    },
  );
});
