import { defineApplication, FieldType } from 'twenty-sdk/define';

import { DEFAULT_MIN_LIKELIHOOD } from 'src/constants/default-min-likelihood';
import { DEFAULT_WEAK_IDENTIFIER_MIN_LIKELIHOOD } from 'src/constants/default-weak-identifier-min-likelihood';
import { PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-min-likelihood-env-var-name';
import { PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-company-weak-identifier-min-likelihood-env-var-name';
import { PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-min-likelihood-env-var-name';
import { PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME } from 'src/constants/pdl-person-weak-identifier-min-likelihood-env-var-name';
import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  PDL_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'People Data Labs',
  description: 'Enrich People and Companies with People Data Labs data.',
  logo: 'public/people-data-labs-icon.png',
  category: 'Enrichment',
  author: 'Twenty',
  galleryImages: ['public/gallery/cover.png'],
  billing: {
    description:
      '$0.336 per person match and $0.12 per company match. Not found and skipped records are free. Billed to your Twenty credits.',
  },
  applicationVariables: {
    [PDL_PERSON_MIN_LIKELIHOOD_ENV_VAR_NAME]: {
      universalIdentifier:
        PDL_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.personMinLikelihood,
      label: 'Minimum likelihood for people',
      description:
        'Minimum match likelihood (1-10) for people enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: DEFAULT_MIN_LIKELIHOOD,
    },
    [PDL_COMPANY_MIN_LIKELIHOOD_ENV_VAR_NAME]: {
      universalIdentifier:
        PDL_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.companyMinLikelihood,
      label: 'Minimum likelihood for companies',
      description:
        'Minimum match likelihood (1-10) for company enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: DEFAULT_MIN_LIKELIHOOD,
    },
    [PDL_PERSON_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME]: {
      universalIdentifier:
        PDL_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.personWeakIdentifierMinLikelihood,
      label: 'Minimum likelihood for name-based people matches',
      description:
        'Minimum match likelihood (1-10) when matching a person by name and company. Uses the higher of this value and the people minimum. Explicit workflow minimum likelihoods take precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: DEFAULT_WEAK_IDENTIFIER_MIN_LIKELIHOOD,
    },
    [PDL_COMPANY_WEAK_IDENTIFIER_MIN_LIKELIHOOD_ENV_VAR_NAME]: {
      universalIdentifier:
        PDL_APPLICATION_VARIABLE_UNIVERSAL_IDENTIFIERS.companyWeakIdentifierMinLikelihood,
      label: 'Minimum likelihood for name-based company matches',
      description:
        'Minimum match likelihood (1-10) when matching a company by name only. Uses the higher of this value and the company minimum. Explicit workflow minimum likelihoods take precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: DEFAULT_WEAK_IDENTIFIER_MIN_LIKELIHOOD,
    },
  },
  serverVariables: {
    PDL_API_KEY: {
      description: 'People Data Labs API key',
      isSecret: true,
      isRequired: true,
    },
  },
});
