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
      label: 'Your People Data Labs API key',
      description:
        'Optional. When set, enrichment uses your People Data Labs account and matches are billed there instead of in Twenty credits. Leave empty to use the default key.',
      type: FieldType.TEXT,
      isSecret: true,
    },
  },
  serverVariables: {
    PDL_API_KEY: {
      description:
        'Default People Data Labs API key, used by workspaces that have not set their own key',
      isSecret: true,
    },
  },
});
