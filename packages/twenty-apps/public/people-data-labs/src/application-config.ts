import { defineApplication, FieldType } from 'twenty-sdk/define';

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
    PDL_PERSON_MIN_LIKELIHOOD: {
      universalIdentifier: 'a45f04fd-ce7b-468a-bc79-5945041dc7e8',
      label: 'Minimum likelihood for people',
      description:
        'Minimum match likelihood (1-10) for people enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: 2,
    },
    PDL_COMPANY_MIN_LIKELIHOOD: {
      universalIdentifier: '8301c260-5028-42f5-8f10-8b74d5d4d134',
      label: 'Minimum likelihood for companies',
      description:
        'Minimum match likelihood (1-10) for company enrichment. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: 2,
    },
    PDL_WEAK_IDENTIFIER_MIN_LIKELIHOOD: {
      universalIdentifier: '4160c7ad-fc3f-405d-87ed-7950292fbe22',
      label: 'Minimum likelihood for name-based matches',
      description:
        'Minimum match likelihood (1-10) when matching a person by name and company, or a company by name only. Uses the higher of this value and the people or company minimum. An explicit workflow minimum likelihood takes precedence.',
      type: FieldType.NUMBER,
      isSecret: false,
      value: 6,
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
