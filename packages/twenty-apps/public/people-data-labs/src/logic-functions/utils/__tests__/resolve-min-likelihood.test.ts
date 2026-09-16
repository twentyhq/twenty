import { describe, expect, it } from 'vitest';

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

  it.each([1, 6, 10])(
    'uses an explicit likelihood of %s regardless of identifier strength',
    (inputMinLikelihood) => {
      expect(
        resolveMinLikelihood({ inputMinLikelihood, hasStrongIdentifier: true }),
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
