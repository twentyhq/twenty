import { defineApplication, FieldType } from 'twenty-sdk/define';

import { IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: IDENTIFIERS.application,
  displayName: 'CompanyEnrich',
  description:
    'Research companies and professional profiles, find similar accounts, and enrich CRM records with CompanyEnrich.',
  author: 'CompanyEnrich',
  category: 'Enrichment',
  logo: 'public/logo.svg',
  websiteUrl: 'https://companyenrich.com',
  termsUrl: 'https://companyenrich.com/terms-and-conditions',
  issueReportUrl: 'https://github.com/twentyhq/twenty/issues',
  applicationVariables: {
    COMPANYENRICH_API_KEY: {
      universalIdentifier: IDENTIFIERS.apiKey,
      label: 'CompanyEnrich API key',
      description:
        'Your CompanyEnrich API key. Requests consume credits in your CompanyEnrich account; no Twenty credits are charged by this app.',
      type: FieldType.TEXT,
      isSecret: true,
      isRequired: true,
    },
  },
});
