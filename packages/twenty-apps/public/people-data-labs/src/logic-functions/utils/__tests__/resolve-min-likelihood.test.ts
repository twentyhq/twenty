import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { resolveMinLikelihood } from 'src/logic-functions/utils/resolve-min-likelihood';

describe('resolveMinLikelihood', () => {
  beforeEach(() => {
    vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', undefined);
    vi.stubEnv('PDL_COMPANY_MIN_LIKELIHOOD', undefined);
    vi.stubEnv('PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD', undefined);
    vi.stubEnv('PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD', undefined);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe.each([
    {
      variableName: 'PDL_PERSON_MIN_LIKELIHOOD',
      weakVariableName: 'PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD',
      label: 'people',
    },
    {
      variableName: 'PDL_COMPANY_MIN_LIKELIHOOD',
      weakVariableName: 'PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD',
      label: 'companies',
    },
  ] as const)('$label', ({ variableName, weakVariableName, label }) => {
    it.each([undefined, '', '   '])(
      'uses application variable defaults when the setting is %j',
      (value) => {
        vi.stubEnv(variableName, value);
        vi.stubEnv(weakVariableName, value);

        expect(
          resolveMinLikelihood({
            inputMinLikelihood: undefined,
            minLikelihoodVariableName: variableName,
            hasStrongIdentifier: true,
          }),
        ).toBe(2);
        expect(
          resolveMinLikelihood({
            inputMinLikelihood: null,
            minLikelihoodVariableName: variableName,
            hasStrongIdentifier: false,
          }),
        ).toBe(6);
      },
    );

    it.each([
      { value: '1', strongMinimum: 1, weakMinimum: 6 },
      { value: '7', strongMinimum: 7, weakMinimum: 7 },
      { value: '10', strongMinimum: 10, weakMinimum: 10 },
      { value: ' 7 ', strongMinimum: 7, weakMinimum: 7 },
    ])(
      'uses the configured minimum of $value with a floor for name-based matches',
      ({ value, strongMinimum, weakMinimum }) => {
        vi.stubEnv(variableName, value);

        expect(
          resolveMinLikelihood({
            inputMinLikelihood: undefined,
            minLikelihoodVariableName: variableName,
            hasStrongIdentifier: true,
          }),
        ).toBe(strongMinimum);
        expect(
          resolveMinLikelihood({
            inputMinLikelihood: undefined,
            minLikelihoodVariableName: variableName,
            hasStrongIdentifier: false,
          }),
        ).toBe(weakMinimum);
      },
    );

    it.each(['-1', '0', '11', '1.5', 'NaN', 'Infinity', '7invalid'])(
      'rejects an invalid configured minimum of %j',
      (value) => {
        vi.stubEnv(variableName, value);

        expect(() =>
          resolveMinLikelihood({
            inputMinLikelihood: undefined,
            minLikelihoodVariableName: variableName,
            hasStrongIdentifier: true,
          }),
        ).toThrow(
          new PdlConfigError(
            `Minimum likelihood for ${label} must be an integer between 1 and 10.`,
          ),
        );
      },
    );
  });

  it.each([
    { minimum: '2', weakMinimum: '3', expected: 3 },
    { minimum: '2', weakMinimum: '9', expected: 9 },
    { minimum: '8', weakMinimum: '3', expected: 8 },
  ])(
    'uses $expected for name-based matches with minimums $minimum and $weakMinimum',
    ({ minimum, weakMinimum, expected }) => {
      vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', minimum);
      vi.stubEnv('PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD', weakMinimum);

      expect(
        resolveMinLikelihood({
          inputMinLikelihood: undefined,
          minLikelihoodVariableName: 'PDL_PERSON_MIN_LIKELIHOOD',
          hasStrongIdentifier: false,
        }),
      ).toBe(expected);
    },
  );

  it('validates the name-based setting only for weak identifiers', () => {
    vi.stubEnv('PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD', 'invalid');

    expect(
      resolveMinLikelihood({
        inputMinLikelihood: undefined,
        minLikelihoodVariableName: 'PDL_PERSON_MIN_LIKELIHOOD',
        hasStrongIdentifier: true,
      }),
    ).toBe(2);
    expect(() =>
      resolveMinLikelihood({
        inputMinLikelihood: undefined,
        minLikelihoodVariableName: 'PDL_PERSON_MIN_LIKELIHOOD',
        hasStrongIdentifier: false,
      }),
    ).toThrow(
      new PdlConfigError(
        'Minimum likelihood for name-based people matches must be an integer between 1 and 10.',
      ),
    );
  });

  it.each([1, 6, 10])(
    'uses an explicit likelihood of %s over invalid settings for both identifier strengths',
    (inputMinLikelihood) => {
      vi.stubEnv('PDL_PERSON_MIN_LIKELIHOOD', 'invalid');
      vi.stubEnv('PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD', 'invalid');

      for (const hasStrongIdentifier of [true, false]) {
        expect(
          resolveMinLikelihood({
            inputMinLikelihood,
            minLikelihoodVariableName: 'PDL_PERSON_MIN_LIKELIHOOD',
            hasStrongIdentifier,
          }),
        ).toBe(inputMinLikelihood);
      }
    },
  );

  it.each([-1, 0, 11, 1.5, NaN, Infinity])(
    'rejects an invalid input likelihood of %s',
    (inputMinLikelihood) => {
      expect(() =>
        resolveMinLikelihood({
          inputMinLikelihood,
          minLikelihoodVariableName: 'PDL_PERSON_MIN_LIKELIHOOD',
          hasStrongIdentifier: true,
        }),
      ).toThrow(
        new PdlInvalidInputError(
          'Minimum likelihood must be an integer between 1 and 10.',
        ),
      );
    },
  );
});
