import { describe, expect, it } from 'vitest';

import { PdlConfigError } from 'src/logic-functions/errors/pdl-config-error';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { resolveMinLikelihood } from 'src/logic-functions/utils/resolve-min-likelihood';

describe('resolveMinLikelihood', () => {
  it.each([undefined, null])(
    'keeps identifier-dependent defaults when the input is %s',
    (inputMinLikelihood) => {
      expect(
        resolveMinLikelihood({ inputMinLikelihood, hasStrongIdentifier: true }),
      ).toBe(2);
      expect(
        resolveMinLikelihood({ inputMinLikelihood, hasStrongIdentifier: false }),
      ).toBe(6);
    },
  );

  it.each(['', '   '])(
    'keeps identifier-dependent defaults when the configured default is %j',
    (defaultMinLikelihood) => {
      expect(
        resolveMinLikelihood({
          inputMinLikelihood: undefined,
          defaultMinLikelihood,
          hasStrongIdentifier: true,
        }),
      ).toBe(2);
      expect(
        resolveMinLikelihood({
          inputMinLikelihood: undefined,
          defaultMinLikelihood,
          hasStrongIdentifier: false,
        }),
      ).toBe(6);
    },
  );

  it.each(['1', '7', '10', ' 7 '])(
    'uses the configured default of %j regardless of identifier strength',
    (defaultMinLikelihood) => {
      expect(
        resolveMinLikelihood({
          inputMinLikelihood: undefined,
          defaultMinLikelihood,
          hasStrongIdentifier: true,
        }),
      ).toBe(Number(defaultMinLikelihood));
      expect(
        resolveMinLikelihood({
          inputMinLikelihood: null,
          defaultMinLikelihood,
          hasStrongIdentifier: false,
        }),
      ).toBe(Number(defaultMinLikelihood));
    },
  );

  it.each(['8', 'invalid'])(
    'uses an explicit likelihood over the configured default of %j',
    (defaultMinLikelihood) => {
      expect(
        resolveMinLikelihood({
          inputMinLikelihood: 4,
          defaultMinLikelihood,
          hasStrongIdentifier: true,
        }),
      ).toBe(4);
    },
  );

  it.each(['-1', '0', '11', '1.5', 'NaN', 'Infinity', '7invalid'])(
    'rejects an invalid configured default of %j',
    (defaultMinLikelihood) => {
      expect(() =>
        resolveMinLikelihood({
          inputMinLikelihood: undefined,
          defaultMinLikelihood,
          hasStrongIdentifier: true,
        }),
      ).toThrow(
        new PdlConfigError(
          'Default minimum likelihood must be an integer between 1 and 10.',
        ),
      );
    },
  );

  it.each([1, 6, 10])(
    'uses an explicit likelihood of %s regardless of identifier strength',
    (inputMinLikelihood) => {
      expect(
        resolveMinLikelihood({
          inputMinLikelihood,
          defaultMinLikelihood: '7',
          hasStrongIdentifier: true,
        }),
      ).toBe(inputMinLikelihood);
      expect(
        resolveMinLikelihood({ inputMinLikelihood, hasStrongIdentifier: false }),
      ).toBe(inputMinLikelihood);
    },
  );

  it.each([-1, 0, 11, 1.5, NaN, Infinity])(
    'rejects an invalid likelihood of %s',
    (inputMinLikelihood) => {
      expect(() =>
        resolveMinLikelihood({ inputMinLikelihood, hasStrongIdentifier: true }),
      ).toThrow(
        new PdlInvalidInputError(
          'Minimum likelihood must be an integer between 1 and 10.',
        ),
      );
    },
  );
});
