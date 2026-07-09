import { defineApplication, FieldType } from 'twenty-sdk/define';

import {
  APPLICATION_UNIVERSAL_IDENTIFIER,
  MIGRATION_BATCH_SIZE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  MIGRATION_ERROR_RECORD_LIMIT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
  SALESFORCE_API_VERSION_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Salesforce Migration',
  description:
    'Move your Salesforce data to Twenty: analyze your org, review a detailed migration plan, then run a transparent, resumable, idempotent migration.',
  logoUrl: 'public/logo.svg',
  category: 'Data',
  author: 'Twenty',
  applicationVariables: {
    SALESFORCE_API_VERSION: {
      universalIdentifier: SALESFORCE_API_VERSION_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Salesforce REST API version to use, without the "v" prefix.',
      isSecret: false,
      type: FieldType.TEXT,
      value: '62.0',
    },
    MIGRATION_BATCH_SIZE: {
      universalIdentifier: MIGRATION_BATCH_SIZE_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'How many Salesforce records are fetched and written per batch. Lower it if your Salesforce org enforces strict API limits.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: 200,
    },
    MIGRATION_ERROR_RECORD_LIMIT: {
      universalIdentifier:
        MIGRATION_ERROR_RECORD_LIMIT_APP_VARIABLE_UNIVERSAL_IDENTIFIER,
      description:
        'Maximum number of per-record error entries stored per migration. Failures beyond the limit are still counted, just not stored individually.',
      isSecret: false,
      type: FieldType.NUMBER,
      value: 500,
    },
  },
  serverVariables: {
    SALESFORCE_CLIENT_ID: {
      description:
        'Consumer Key of the Salesforce Connected App used for the OAuth connection (see the app README for setup steps).',
      isSecret: false,
      isRequired: true,
      type: FieldType.TEXT,
    },
    SALESFORCE_CLIENT_SECRET: {
      description:
        'Consumer Secret of the Salesforce Connected App used for the OAuth connection.',
      isSecret: true,
      isRequired: true,
      type: FieldType.TEXT,
    },
  },
});
