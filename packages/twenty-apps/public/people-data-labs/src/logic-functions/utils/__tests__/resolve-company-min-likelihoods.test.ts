import { afterEach, describe, expect, it, vi } from 'vitest';

import { MIN_LIKELIHOOD_SETTINGS } from 'src/constants/min-likelihood-settings';
import { resolveCompanyMinLikelihoods } from 'src/logic-functions/utils/resolve-company-min-likelihoods';

describe('resolveCompanyMinLikelihoods', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads only the company settings', () => {
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.company.strongIdentifier.variableName,
      '4',
    );
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.company.weakIdentifier.variableName,
      '10',
    );
    vi.stubEnv(
      MIN_LIKELIHOOD_SETTINGS.person.strongIdentifier.variableName,
      '3',
    );
    vi.stubEnv(MIN_LIKELIHOOD_SETTINGS.person.weakIdentifier.variableName, '9');

    expect(resolveCompanyMinLikelihoods({ input: { records: [] } })).toEqual({
      strongIdentifierMinLikelihood: 4,
      weakIdentifierMinLikelihood: 10,
    });
  });
});
