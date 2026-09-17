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
  applicationVariables: {
    PDL_CUSTOM_API_KEY: {
      universalIdentifier: 'ac62542c-a807-4100-99d8-6c4a88b895cc',
      label: 'People Data Labs API key',
      description:
        'Optional API key for your People Data Labs account. When set, enrichment uses this key without charging Twenty credits. Leave blank to use Twenty credits.',
      type: FieldType.TEXT,
      isSecret: true,
    },
  },
  serverVariables: {
    PDL_API_KEY: {
      description: 'Twenty-managed People Data Labs API key',
      isSecret: true,
    },
  },
});
