import { type MarketplaceAppDTO } from 'src/engine/core-modules/application/dtos/marketplace-app.dto';

// Readable mock identifiers for the Data Enrichment app
const MOCK_APP_ID = 'a1b2c3d4-0000-0000-0000-000000000001';
const MOCK_ROLE_ID = 'a1b2c3d4-0000-0000-0000-000000000010';
const MOCK_ENRICHMENT_JOB_UNIVERSAL_ID = 'a1b2c3d4-0000-0000-0000-000000000100';

// Standard object universalIdentifiers from STANDARD_OBJECTS
const COMPANY_UNIVERSAL_ID = '20202020-b374-4779-a561-80086cb2e17f';
const PERSON_UNIVERSAL_ID = '20202020-e674-48e5-a542-72570eee7213';

// Standard field universalIdentifiers
const COMPANY_NAME_FIELD_UNIVERSAL_ID = '20202020-4d99-4e2e-a84c-4a27837b1ece';

// Enrichment job field universalIdentifiers
const MOCK_ENRICHMENT_JOB_STATUS_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000101';
const MOCK_ENRICHMENT_JOB_PROVIDER_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000102';
const MOCK_ENRICHMENT_JOB_ENRICHED_AT_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000103';
const MOCK_ENRICHMENT_JOB_RECORD_ID_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000104';

// App-provided field universalIdentifiers on standard objects
const COMPANY_INDUSTRY_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000201';
const COMPANY_EMPLOYEE_COUNT_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000202';
const PERSON_LINKEDIN_URL_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000203';
const PERSON_JOB_TITLE_FIELD_UNIVERSAL_ID =
  'a1b2c3d4-0000-0000-0000-000000000204';

const MOCK_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#1a2744"><ellipse cx="38" cy="20" rx="28" ry="10"/><rect x="10" y="20" width="56" height="50"/><ellipse cx="38" cy="70" rx="28" ry="10"/><ellipse cx="38" cy="35" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="38" cy="52" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="72" cy="62" r="22" fill="#1a2744"/><circle cx="72" cy="62" r="18" fill="#fff"/><path d="M72 50 L72 74 M62 58 L72 48 L82 58" stroke="#1a2744" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;

export const MOCKED_MARKETPLACE_APP: MarketplaceAppDTO = {
  id: MOCK_APP_ID,
  name: 'Data Enrichment',
  description: 'Enrich your data easily. Choose your provider.',
  icon: 'IconSparkles',
  version: '1.0.0',
  author: 'Cosmos Labs',
  category: 'Data',
  logo: `data:image/svg+xml,${encodeURIComponent(MOCK_LOGO_SVG)}`,
  screenshots: [
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+1',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+2',
    'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+3',
  ],
  aboutDescription:
    'Enhance your workspace with automated data intelligence. This app monitors your new records and automatically populates missing details such as job titles, company size, social profiles, and industry insights.',
  providers: ['Clearbit', 'Apollo', 'Hunter.io'],
  websiteUrl: 'https://google.com',
  termsUrl: 'https://google.com',
  objects: [
    {
      universalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
      nameSingular: 'enrichmentJob',
      namePlural: 'enrichmentJobs',
      labelSingular: 'Enrichment Job',
      labelPlural: 'Enrichment Jobs',
      description: 'Tracks data enrichment requests and their status',
      icon: 'IconSparkles',
      fields: [
        {
          name: 'status',
          type: 'SELECT',
          label: 'Status',
          description: 'Current status of the enrichment job',
          icon: 'IconProgressCheck',
          universalIdentifier: MOCK_ENRICHMENT_JOB_STATUS_FIELD_UNIVERSAL_ID,
          objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
        },
        {
          name: 'provider',
          type: 'TEXT',
          label: 'Provider',
          description: 'Enrichment provider used',
          icon: 'IconCloud',
          universalIdentifier: MOCK_ENRICHMENT_JOB_PROVIDER_FIELD_UNIVERSAL_ID,
          objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
        },
        {
          name: 'enrichedAt',
          type: 'DATE_TIME',
          label: 'Enriched At',
          description: 'When the enrichment was completed',
          icon: 'IconCalendar',
          universalIdentifier:
            MOCK_ENRICHMENT_JOB_ENRICHED_AT_FIELD_UNIVERSAL_ID,
          objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
        },
        {
          name: 'recordId',
          type: 'TEXT',
          label: 'Record ID',
          description: 'ID of the enriched record',
          icon: 'IconKey',
          universalIdentifier: MOCK_ENRICHMENT_JOB_RECORD_ID_FIELD_UNIVERSAL_ID,
          objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
        },
      ],
    },
  ],
  fields: [
    {
      name: 'industry',
      type: 'TEXT',
      label: 'Industry',
      description: 'Company industry from enrichment',
      icon: 'IconBuildingFactory2',
      objectUniversalIdentifier: COMPANY_UNIVERSAL_ID,
      universalIdentifier: COMPANY_INDUSTRY_FIELD_UNIVERSAL_ID,
    },
    {
      name: 'employeeCount',
      type: 'NUMBER',
      label: 'Employee Count',
      description: 'Number of employees from enrichment',
      icon: 'IconUsers',
      objectUniversalIdentifier: COMPANY_UNIVERSAL_ID,
      universalIdentifier: COMPANY_EMPLOYEE_COUNT_FIELD_UNIVERSAL_ID,
    },
    {
      name: 'linkedInUrl',
      type: 'LINKS',
      label: 'LinkedIn URL',
      description: 'LinkedIn profile URL from enrichment',
      icon: 'IconBrandLinkedin',
      objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
      universalIdentifier: PERSON_LINKEDIN_URL_FIELD_UNIVERSAL_ID,
    },
    {
      name: 'jobTitle',
      type: 'TEXT',
      label: 'Job Title',
      description: 'Job title from enrichment',
      icon: 'IconBriefcase',
      objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
      universalIdentifier: PERSON_JOB_TITLE_FIELD_UNIVERSAL_ID,
    },
  ],
  logicFunctions: [
    {
      name: 'enrich-on-create',
      description: 'Automatically enriches new records when they are created',
      timeoutSeconds: 30,
    },
  ],
  frontComponents: [],
  defaultRole: {
    id: MOCK_ROLE_ID,
    label: 'Data Enrichment default role',
    description: 'Default permissions for the Data Enrichment app',
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canDestroyAllObjectRecords: true,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    objectPermissions: [
      {
        // Company: revoke soft-delete
        objectUniversalIdentifier: COMPANY_UNIVERSAL_ID,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
      {
        // Person: no overrides (matches defaults)
        objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: true,
        canDestroyObjectRecords: false,
      },
      {
        // Enrichment Job (app-custom object): revoke soft-delete
        objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_UNIVERSAL_ID,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      },
    ],
    fieldPermissions: [
      {
        objectUniversalIdentifier: COMPANY_UNIVERSAL_ID,
        fieldUniversalIdentifier: COMPANY_NAME_FIELD_UNIVERSAL_ID,
        canReadFieldValue: true,
        canUpdateFieldValue: false,
      },
      {
        objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
        fieldUniversalIdentifier: PERSON_JOB_TITLE_FIELD_UNIVERSAL_ID,
        canReadFieldValue: true,
        canUpdateFieldValue: false,
      },
    ],
    permissionFlags: ['DATA_MODEL', 'API_KEYS_AND_WEBHOOKS'],
  },
};
