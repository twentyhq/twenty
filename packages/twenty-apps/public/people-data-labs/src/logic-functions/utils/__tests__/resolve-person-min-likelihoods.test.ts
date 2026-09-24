import { afterEach, describe, expect, it, vi } from 'vitest';

import { MIN_LIKELIHOOD_SETTINGS } from 'src/constants/min-likelihood-settings';
import { resolvePersonMinLikelihoods } from 'src/logic-functions/utils/resolve-person-min-likelihoods';

describe('resolvePersonMinLikelihoods', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads only the person settings', () => {
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

    expect(resolvePersonMinLikelihoods({ input: { records: [] } })).toEqual({
      strongIdentifierMinLikelihood: 3,
      weakIdentifierMinLikelihood: 9,
    });
  });
});
