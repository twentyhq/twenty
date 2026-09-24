import { type MinLikelihoodSettings } from 'src/types/min-likelihood-settings';

export const MIN_LIKELIHOOD_SETTINGS = {
  person: {
    strongIdentifier: {
      variableName: 'PDL_PERSON_MIN_LIKELIHOOD',
      label: 'Minimum likelihood for people',
      defaultValue: 2,
    },
    weakIdentifier: {
      variableName: 'PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD',
      label: 'Minimum likelihood for name-based people matches',
      defaultValue: 6,
    },
  },
  company: {
    strongIdentifier: {
      variableName: 'PDL_COMPANY_MIN_LIKELIHOOD',
      label: 'Minimum likelihood for companies',
      defaultValue: 2,
    },
    weakIdentifier: {
      variableName: 'PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD',
      label: 'Minimum likelihood for name-based company matches',
      defaultValue: 6,
    },
  },
} as const satisfies Record<string, MinLikelihoodSettings>;
