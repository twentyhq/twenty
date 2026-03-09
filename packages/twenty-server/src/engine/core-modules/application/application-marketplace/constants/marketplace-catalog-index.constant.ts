import { type MarketplaceDisplayData } from 'src/engine/core-modules/application/application-marketplace/types/marketplace-display-data.type';

export type CuratedAppEntry = {
  universalIdentifier: string;
  sourcePackage: string;
  isFeatured: boolean;

  name: string;
  description: string;
  author: string;
  logoUrl?: string;
  websiteUrl?: string;
  termsUrl?: string;

  richDisplayData: MarketplaceDisplayData;
};

const MOCK_ENRICHMENT_APP_ID = 'a1b2c3d4-0000-0000-0000-000000000001';
const MOCK_ENRICHMENT_JOB_ID = 'a1b2c3d4-0000-0000-0000-000000000100';

const COMPANY_UNIVERSAL_ID = '20202020-b374-4779-a561-80086cb2e17f';
const PERSON_UNIVERSAL_ID = '20202020-e674-48e5-a542-72570eee7213';

const MOCK_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="#1a2744"><ellipse cx="38" cy="20" rx="28" ry="10"/><rect x="10" y="20" width="56" height="50"/><ellipse cx="38" cy="70" rx="28" ry="10"/><ellipse cx="38" cy="35" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="38" cy="52" rx="28" ry="10" fill="none" stroke="#fff" stroke-width="3"/><circle cx="72" cy="62" r="22" fill="#1a2744"/><circle cx="72" cy="62" r="18" fill="#fff"/><path d="M72 50 L72 74 M62 58 L72 48 L82 58" stroke="#1a2744" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
const ENCODED_MOCK_LOGO = `data:image/svg+xml,${encodeURIComponent(MOCK_LOGO_SVG)}`;

export const MARKETPLACE_CATALOG_INDEX: CuratedAppEntry[] = [
  {
    universalIdentifier: MOCK_ENRICHMENT_APP_ID,
    sourcePackage: '@twentyhq/app-data-enrichment',
    isFeatured: true,
    name: 'Data Enrichment',
    description: 'Enrich your data easily. Choose your provider.',
    author: 'Twenty',
    logoUrl: ENCODED_MOCK_LOGO,
    websiteUrl: 'https://twenty.com',
    richDisplayData: {
      icon: 'IconSparkles',
      version: '1.0.0',
      category: 'Data',
      logo: ENCODED_MOCK_LOGO,
      screenshots: [
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+1',
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+2',
        'https://placehold.co/800x400/f5f5f5/666?text=Screenshot+3',
      ],
      aboutDescription:
        'Enhance your workspace with automated data intelligence. This app monitors your new records and automatically populates missing details such as job titles, company size, social profiles, and industry insights.',
      providers: ['Clearbit', 'Apollo', 'Hunter.io'],
      objects: [
        {
          universalIdentifier: MOCK_ENRICHMENT_JOB_ID,
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
              universalIdentifier: 'a1b2c3d4-0000-0000-0000-000000000101',
              objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_ID,
            },
            {
              name: 'provider',
              type: 'TEXT',
              label: 'Provider',
              description: 'Enrichment provider used',
              icon: 'IconCloud',
              universalIdentifier: 'a1b2c3d4-0000-0000-0000-000000000102',
              objectUniversalIdentifier: MOCK_ENRICHMENT_JOB_ID,
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
          universalIdentifier: 'a1b2c3d4-0000-0000-0000-000000000201',
        },
        {
          name: 'linkedInUrl',
          type: 'LINKS',
          label: 'LinkedIn URL',
          description: 'LinkedIn profile URL from enrichment',
          icon: 'IconBrandLinkedin',
          objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
          universalIdentifier: 'a1b2c3d4-0000-0000-0000-000000000203',
        },
      ],
      logicFunctions: [
        {
          name: 'enrich-on-create',
          description:
            'Automatically enriches new records when they are created',
          timeoutSeconds: 30,
        },
      ],
      frontComponents: [],
      defaultRole: {
        id: 'a1b2c3d4-0000-0000-0000-000000000010',
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
            objectUniversalIdentifier: COMPANY_UNIVERSAL_ID,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
          {
            objectUniversalIdentifier: PERSON_UNIVERSAL_ID,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: true,
            canDestroyObjectRecords: false,
          },
        ],
        fieldPermissions: [],
        permissionFlags: ['DATA_MODEL', 'API_KEYS_AND_WEBHOOKS'],
      },
    },
  },
  {
    universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
    sourcePackage: '@twentyhq/hello-world',
    isFeatured: false,
    name: 'Hello World',
    description: 'A simple hello world app to get started with Twenty apps.',
    author: 'Twenty',
    websiteUrl: 'https://twenty.com',
    richDisplayData: {
      icon: 'IconWorld',
      version: '0.2.2',
      category: 'Getting Started',
      screenshots: [],
      aboutDescription:
        'A minimal example app that demonstrates the Twenty app framework. Creates a PostCard object and a logic function to generate new postcards. Great starting point for building your own apps.',
      providers: [],
      objects: [
        {
          universalIdentifier: 'e2c3d4f5-0000-0000-0000-000000000001',
          nameSingular: 'postCard',
          namePlural: 'postCards',
          labelSingular: 'Post Card',
          labelPlural: 'Post Cards',
          description: 'A simple postcard object',
          icon: 'IconMail',
          fields: [],
        },
      ],
      fields: [],
      logicFunctions: [
        {
          name: 'create-new-post-card',
          description: 'Creates a new postcard record',
        },
      ],
      frontComponents: [],
    },
  },
];
