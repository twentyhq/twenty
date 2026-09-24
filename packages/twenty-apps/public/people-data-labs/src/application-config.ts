import { defineApplication, FieldType } from 'twenty-sdk/define';

import { MIN_LIKELIHOOD_SETTINGS } from 'src/constants/min-likelihood-settings';
import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

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
    [MIN_LIKELIHOOD_SETTINGS.person.strongIdentifier.variableName]: {
      universalIdentifier: 'a45f04fd-ce7b-468a-bc79-5945041dc7e8',
      label: MIN_LIKELIHOOD_SETTINGS.person.strongIdentifier.label,
      description:
        'Minimum match likelihood (1-10) for people enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: MIN_LIKELIHOOD_SETTINGS.person.strongIdentifier.defaultValue,
    },
    [MIN_LIKELIHOOD_SETTINGS.company.strongIdentifier.variableName]: {
      universalIdentifier: '8301c260-5028-42f5-8f10-8b74d5d4d134',
      label: MIN_LIKELIHOOD_SETTINGS.company.strongIdentifier.label,
      description:
        'Minimum match likelihood (1-10) for company enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: MIN_LIKELIHOOD_SETTINGS.company.strongIdentifier.defaultValue,
    },
    [MIN_LIKELIHOOD_SETTINGS.person.weakIdentifier.variableName]: {
      universalIdentifier: '4160c7ad-fc3f-405d-87ed-7950292fbe22',
      label: MIN_LIKELIHOOD_SETTINGS.person.weakIdentifier.label,
      description:
        'Minimum match likelihood (1-10) when matching a person by name and company. Uses the higher of this value and the people minimum. Explicit workflow minimum likelihoods take precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: MIN_LIKELIHOOD_SETTINGS.person.weakIdentifier.defaultValue,
    },
    [MIN_LIKELIHOOD_SETTINGS.company.weakIdentifier.variableName]: {
      universalIdentifier: '1f608910-8ab1-4546-b27f-44507eb3d6f8',
      label: MIN_LIKELIHOOD_SETTINGS.company.weakIdentifier.label,
      description:
        'Minimum match likelihood (1-10) when matching a company by name only. Uses the higher of this value and the company minimum. Explicit workflow minimum likelihoods take precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: MIN_LIKELIHOOD_SETTINGS.company.weakIdentifier.defaultValue,
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
