import { defineApplication, FieldType } from 'twenty-sdk/define';

import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'People Data Labs',
  description: 'Enrich People and Companies with People Data Labs data.',
  logoUrl: 'public/people-data-labs-icon.png',
  category: 'Enrichment',
  author: 'Twenty',
  screenshots: ['public/gallery/cover.png'],
  serverVariables: {
    PDL_API_KEY: {
      description: 'People Data Labs API key',
      isSecret: true,
      isRequired: true,
    },
    PDL_PERSON_MIN_LIKELIHOOD: {
      description:
        'Default minimum likelihood (1-10) for people enrichment. Used by command menu items and workflow nodes without an explicit minimum likelihood. When unset, uses 2 for strong identifiers and 6 for name-based matches.',
      type: FieldType.NUMBER,
      isSecret: false,
    },
    PDL_COMPANY_MIN_LIKELIHOOD: {
      description:
        'Default minimum likelihood (1-10) for company enrichment. Used by command menu items and workflow nodes without an explicit minimum likelihood. When unset, uses 2 for strong identifiers and 6 for name-based matches.',
      type: FieldType.NUMBER,
      isSecret: false,
    },
  },
});
