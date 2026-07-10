import { FieldType } from '@/sdk/define';
import type { Manifest } from 'twenty-shared/application';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  AggregateOperations,
  FieldMetadataType,
  NavigationMenuItemType,
  PageLayoutTabLayoutMode,
  RelationOnDeleteAction,
  RelationType,
  ViewCalendarLayout,
  ViewType,
} from 'twenty-shared/types';

export const EXPECTED_MANIFEST: Manifest = {
  commandMenuItems: [],
  permissionFlags: [],
  pageLayouts: [],
  pageLayoutTabs: [
    {
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000010',
      pageLayoutUniversalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000020',
      title: 'Extra Tab',
      position: 1000,
      icon: 'IconLayout',
      layoutMode: PageLayoutTabLayoutMode.CANVAS,
      widgets: [
        {
          universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000011',
          title: 'Extra Widget',
          type: 'FRONT_COMPONENT',
          configuration: {
            configurationType: 'FRONT_COMPONENT',
            frontComponentUniversalIdentifier:
              '370ae182-743f-4ecb-b625-7ac48e21f0e5',
          },
        },
        {
          universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000012',
          title: 'Total Priority',
          type: 'GRAPH',
          objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
          configuration: {
            configurationType: 'AGGREGATE_CHART',
            aggregateFieldMetadataUniversalIdentifier:
              '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6',
            aggregateOperation: AggregateOperations.SUM,
          },
        },
      ],
    },
  ],
  publicAssets: [
    {
      checksum: '99496069dcc2a1488e1cae9f826d2707',
      fileName: 'favicon.png',
      filePath: 'public/favicon.png',
      fileType: 'png',
    },
  ],
  skills: [],
  agents: [],
  application: {
    applicationVariables: {
      DEFAULT_RECIPIENT_NAME: {
        description: 'Default recipient name for postcards',
        isSecret: false,
        universalIdentifier: '19e94e59-d4fe-4251-8981-b96d0a9f74de',
        value: 'Alex Karp',
      },
      GREETING_TEXT: {
        universalIdentifier: 'ad19edc5-4cc5-4003-a996-aef53a5c8de0',
        description: 'Free text shown on the postcard',
        type: FieldMetadataType.TEXT,
        value: 'Hello from Rich App',
      },
      ENABLE_TRACKING: {
        universalIdentifier: 'b9c58bb2-58c3-4c6c-9877-498ea6c03fde',
        description: 'Toggle delivery tracking',
        type: FieldMetadataType.BOOLEAN,
        value: true,
      },
      MAX_POSTCARDS: {
        universalIdentifier: '5f4497e4-9030-4085-85eb-2c48b8d53713',
        description: 'Maximum postcards per batch',
        type: FieldMetadataType.NUMBER,
        value: 10,
      },
      DISCOUNT_RATE: {
        universalIdentifier: 'd32f810f-06bb-4d29-b0ee-1dc4228f7cb8',
        description: 'Bulk discount rate applied at checkout',
        type: FieldMetadataType.NUMERIC,
        value: 2.5,
      },
      CAMPAIGN_START_DATE: {
        universalIdentifier: '5aa4fcec-e8a3-4bc1-9c7f-762e1f9dfb40',
        description: 'Date the campaign starts',
        type: FieldMetadataType.DATE,
        value: '2026-01-01',
      },
      CAMPAIGN_START_AT: {
        universalIdentifier: '273d0cfd-d6ab-4148-8816-c4a5d4b1d600',
        description: 'Exact moment the campaign starts',
        type: FieldMetadataType.DATE_TIME,
        value: '2026-01-01T09:00:00.000Z',
      },
      DEFAULT_REGION: {
        universalIdentifier: '76c5c321-b6b6-46eb-b4fc-f9f04bb04227',
        description: 'Default shipping region',
        type: FieldMetadataType.SELECT,
        options: [
          { label: 'Europe', value: 'eu' },
          { label: 'United States', value: 'us' },
          { label: 'Asia-Pacific', value: 'apac' },
        ],
        value: 'eu',
      },
      ENABLED_CHANNELS: {
        universalIdentifier: '706a2b08-8284-4715-8bc0-922a99cb26af',
        description: 'Channels the app is allowed to use',
        type: FieldMetadataType.MULTI_SELECT,
        options: [
          { label: 'Email', value: 'email' },
          { label: 'SMS', value: 'sms' },
          { label: 'Postcard', value: 'postcard' },
        ],
        value: ['email', 'postcard'],
      },
      ALLOWED_TAGS: {
        universalIdentifier: 'c1c8a4c9-9130-4ab8-8dce-18d2b50879ed',
        description: 'Free-form tags applied to recipients',
        type: FieldMetadataType.ARRAY,
        value: ['vip', 'returning'],
      },
      PROVIDER_CONFIG: {
        universalIdentifier: '183d5285-c70c-4f29-96e0-c68659fbe5ae',
        description: 'Raw JSON configuration for the printing provider',
        type: FieldMetadataType.RAW_JSON,
        value: { retries: 3, timeoutMs: 5000 },
      },
      WELCOME_MESSAGE: {
        universalIdentifier: '25a66ff5-8458-498e-9e7e-33ea458a6f3c',
        description: 'Rich text welcome message',
        type: FieldMetadataType.RICH_TEXT,
        value: { blocknote: null, markdown: 'Welcome to **Rich App**!' },
      },
    },
    serverVariables: {
      POSTCARD_API_KEY: {
        description: 'API key for the postcard printing service',
        isSecret: true,
        isRequired: true,
      },
      POSTCARD_SENDER_NAME: {
        description: 'Default sender name on postcards',
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_DELIVERY_SPEED: {
        description: 'Delivery speed requested from the provider',
        type: FieldMetadataType.SELECT,
        options: [
          { label: 'Standard', value: 'standard' },
          { label: 'Express', value: 'express' },
        ],
        isSecret: false,
        isRequired: true,
      },
      POSTCARD_DAILY_LIMIT: {
        description: 'Maximum postcards the provider will accept per day',
        type: FieldMetadataType.NUMBER,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_UNIT_PRICE: {
        description: 'Price charged by the provider per postcard',
        type: FieldMetadataType.NUMERIC,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_SANDBOX_MODE: {
        description:
          'Send postcards through the provider sandbox instead of production',
        type: FieldMetadataType.BOOLEAN,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_CONTRACT_START_DATE: {
        description: 'Date the provider contract starts',
        type: FieldMetadataType.DATE,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_CONTRACT_RENEWAL_AT: {
        description: 'Exact moment the provider contract renews',
        type: FieldMetadataType.DATE_TIME,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_ENABLED_REGIONS: {
        description: 'Regions the provider is allowed to ship to',
        type: FieldMetadataType.MULTI_SELECT,
        options: [
          { label: 'Europe', value: 'eu' },
          { label: 'United States', value: 'us' },
          { label: 'Asia-Pacific', value: 'apac' },
        ],
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_WEBHOOK_EVENTS: {
        description: 'Provider webhook events the app subscribes to',
        type: FieldMetadataType.ARRAY,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_PROVIDER_CONFIG: {
        description: 'Raw JSON configuration for the printing provider',
        type: FieldMetadataType.RAW_JSON,
        isSecret: false,
        isRequired: false,
      },
      POSTCARD_INVOICE_NOTE: {
        description: 'Rich text note appended to provider invoices',
        type: FieldMetadataType.RICH_TEXT,
        isSecret: false,
        isRequired: false,
      },
    },
    description: 'A simple rich app',
    displayName: 'Rich App',
    galleryImages: [],
    defaultRoleUniversalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
    yarnLockChecksum: 'd41d8cd98f00b204e9800998ecf8427e',
    packageJsonChecksum: '2851d0e2c3621a57e1fd103a245b6fde',
    requiredServerVersionRange: null,
  },
  frontComponents: [
    {
      builtComponentPath: 'src/root.front-component.mjs',
      builtComponentChecksum: '[checksum]',
      componentName: 'RootComponent',
      description: 'A root-level front component',
      name: 'root-component',
      sourceComponentPath: 'src/root.front-component.tsx',
      universalIdentifier: 'a0a1a2a3-a4a5-4000-8000-000000000001',
      isHeadless: false,
      usesSdkClient: false,
    },
    {
      builtComponentPath: 'src/components/card.front-component.mjs',
      builtComponentChecksum: '[checksum]',
      componentName: 'CardDisplay',
      description: 'A component using an external component file',
      name: 'card-component',
      sourceComponentPath: 'src/components/card.front-component.tsx',
      universalIdentifier: '88c15ae2-5f87-4a6b-b48f-1974bbe62eb7',
      isHeadless: false,
      usesSdkClient: false,
    },
    {
      builtComponentPath: 'src/components/greeting.front-component.mjs',
      builtComponentChecksum: '[checksum]',
      componentName: 'GreetingComponent',
      description: 'A component that uses greeting utility',
      name: 'greeting-component',
      sourceComponentPath: 'src/components/greeting.front-component.tsx',
      universalIdentifier: '370ae182-743f-4ecb-b625-7ac48e21f0e5',
      isHeadless: false,
      usesSdkClient: false,
    },
    {
      builtComponentPath: 'src/components/test.front-component.mjs',
      builtComponentChecksum: '[checksum]',
      componentName: 'TestComponent',
      description: 'A test front component',
      name: 'test-component',
      sourceComponentPath: 'src/components/test.front-component.tsx',
      universalIdentifier: 'f1234567-abcd-4000-8000-000000000001',
      isHeadless: false,
      usesSdkClient: false,
    },
  ],

  indexes: [
    {
      universalIdentifier: 'b6e9d2a1-5a4c-46ca-9d52-42c8f02d1ff0',
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      fields: [
        {
          universalIdentifier: 'b6e9d2a1-5a4c-46ca-9d52-42c8f02d1ff1',
          fieldUniversalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
        },
      ],
    },
  ],

  fields: [
    // Reverse relation fields for rootNote (5 fields)
    {
      description: 'RootNote Root note',
      icon: 'IconTimelineEvent',
      isNullable: true,
      label: 'RootNote',
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
      name: 'targetRootNote',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        'e1478d59-c947-5926-af8b-4b2f0f842c91',
      relationTargetObjectMetadataUniversalIdentifier:
        'b0b1b2b3-b4b5-4000-8000-000000000001',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '7f891268-9376-5d00-b8ec-bc32a023154d',
      universalSettings: {
        joinColumnName: 'targetRootNoteId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'RootNote Root note',
      icon: 'IconFileImport',
      isNullable: true,
      label: 'RootNote',
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
      name: 'targetRootNote',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '34a6b8e9-0187-57e1-86c1-41bacf1b2479',
      relationTargetObjectMetadataUniversalIdentifier:
        'b0b1b2b3-b4b5-4000-8000-000000000001',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'd72bb002-9952-5651-983e-649436949113',
      universalSettings: {
        joinColumnName: 'targetRootNoteId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'RootNote Root note',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'RootNote',
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
      name: 'targetRootNote',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        '7a62bbd6-e697-54b0-8c1c-163ac47c0305',
      relationTargetObjectMetadataUniversalIdentifier:
        'b0b1b2b3-b4b5-4000-8000-000000000001',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '61252ad6-2311-5054-ae51-b318dfd5fbd8',
      universalSettings: {
        joinColumnName: 'targetRootNoteId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'RootNote Root note',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'RootNote',
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
      name: 'targetRootNote',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        '10c1af7e-e541-56bc-b5b3-d0297df3e23d',
      relationTargetObjectMetadataUniversalIdentifier:
        'b0b1b2b3-b4b5-4000-8000-000000000001',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '2f4f3d69-b78e-5465-9e87-17059959fca8',
      universalSettings: {
        joinColumnName: 'targetRootNoteId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    // User-defined relation and field definitions
    {
      label: 'Post Card',
      name: 'postCard',
      objectUniversalIdentifier: 'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      relationTargetFieldMetadataUniversalIdentifier:
        'a1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
      relationTargetObjectMetadataUniversalIdentifier:
        '54b589ca-eeed-4950-a176-358418b85c05',
      type: FieldType.RELATION,
      universalIdentifier: 'a1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
      universalSettings: {
        joinColumnName: 'postCardId',
        onDelete: RelationOnDeleteAction.CASCADE,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      label: 'Post Card Recipients',
      name: 'postCardRecipients',
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      relationTargetFieldMetadataUniversalIdentifier:
        'a1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.RELATION,
      universalIdentifier: 'a1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    {
      label: 'Post Card Recipients',
      name: 'postCardRecipients',
      objectUniversalIdentifier: 'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      relationTargetFieldMetadataUniversalIdentifier:
        'a1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.RELATION,
      universalIdentifier: 'a1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d',
      universalSettings: {
        relationType: RelationType.ONE_TO_MANY,
      },
    },
    {
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      description: 'Post card category',
      label: 'Category',
      name: 'category',
      options: [
        {
          color: 'blue',
          id: 'cd751c81-787d-4581-bc51-efe43f0050a7',
          label: 'Personal',
          position: 0,
          value: 'PERSONAL',
        },
        {
          color: 'green',
          id: 'eec437ca-5beb-41a9-a826-c9a5eca2eef4',
          label: 'Business',
          position: 1,
          value: 'BUSINESS',
        },
        {
          color: 'orange',
          id: 'a5baa37d-1047-4972-b6b8-7faae0e3eac1',
          label: 'Promotional',
          position: 2,
          value: 'PROMOTIONAL',
        },
        {
          color: 'gray',
          id: '877336e4-6591-599f-8cd1-4c7dfae623d7',
          label: 'Other',
          position: 3,
          value: 'OTHER',
        },
      ],
      type: FieldType.SELECT,
      universalIdentifier: 'b602dbd9-e511-49ce-b6d3-b697218dc69c',
    },
    {
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      description: 'Priority level for the post card (1-10)',
      label: 'Priority',
      name: 'priority',
      type: FieldType.NUMBER,
      universalIdentifier: '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6',
    },
    {
      label: 'Recipient',
      name: 'recipient',
      objectUniversalIdentifier: 'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      relationTargetFieldMetadataUniversalIdentifier:
        'a1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d',
      relationTargetObjectMetadataUniversalIdentifier:
        'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.RELATION,
      universalIdentifier: 'a1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d',
      universalSettings: {
        joinColumnName: 'recipientId',
        onDelete: RelationOnDeleteAction.CASCADE,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    // Reverse relation fields for postCardRecipient (5 fields)
    {
      description: 'PostCardRecipient Post Card Recipient',
      icon: 'IconTimelineEvent',
      isNullable: true,
      label: 'PostCardRecipient',
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
      name: 'targetPostCardRecipient',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        '8f95b434-ee92-5c0f-95de-9d489af4d40c',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'a865f403-3843-5850-9a60-04e832220954',
      universalSettings: {
        joinColumnName: 'targetPostCardRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCardRecipient Post Card Recipient',
      icon: 'IconFileImport',
      isNullable: true,
      label: 'PostCardRecipient',
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
      name: 'targetPostCardRecipient',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '0c20df83-8cef-5cd6-9752-b98fb7780904',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '501c46b7-7140-59a0-b703-9844bbcb34b9',
      universalSettings: {
        joinColumnName: 'targetPostCardRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCardRecipient Post Card Recipient',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'PostCardRecipient',
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
      name: 'targetPostCardRecipient',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        'b9642a90-2df5-555b-ab83-23cdce7a4142',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '721418ff-1b53-58ef-8dd7-b58927c085c6',
      universalSettings: {
        joinColumnName: 'targetPostCardRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCardRecipient Post Card Recipient',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'PostCardRecipient',
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
      name: 'targetPostCardRecipient',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        'd938a2d0-1279-5c48-b758-ac52f9460a76',
      relationTargetObjectMetadataUniversalIdentifier:
        'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'feeba797-7ebb-5a36-91cd-7279ff92a2b6',
      universalSettings: {
        joinColumnName: 'targetPostCardRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    // Reverse relation fields for postCard (5 fields)
    {
      description: 'PostCard Post card',
      icon: 'IconTimelineEvent',
      isNullable: true,
      label: 'PostCard',
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
      name: 'targetPostCard',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        '9e58820c-78d7-539d-807c-d84362e1eab6',
      relationTargetObjectMetadataUniversalIdentifier:
        '54b589ca-eeed-4950-a176-358418b85c05',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '47d21bb5-075f-5ed4-ba89-c0e7322a57cd',
      universalSettings: {
        joinColumnName: 'targetPostCardId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCard Post card',
      icon: 'IconFileImport',
      isNullable: true,
      label: 'PostCard',
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
      name: 'targetPostCard',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '3f0d38c8-a50f-51c7-bdcb-84a715f4b92d',
      relationTargetObjectMetadataUniversalIdentifier:
        '54b589ca-eeed-4950-a176-358418b85c05',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '4d3cf1bd-d87d-5325-8fbc-19f72c252050',
      universalSettings: {
        joinColumnName: 'targetPostCardId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCard Post card',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'PostCard',
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
      name: 'targetPostCard',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        'def1f10a-847b-574e-a0a2-177caf02129c',
      relationTargetObjectMetadataUniversalIdentifier:
        '54b589ca-eeed-4950-a176-358418b85c05',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'bc1f9abe-e27b-574a-9290-a1c9c8255a6b',
      universalSettings: {
        joinColumnName: 'targetPostCardId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'PostCard Post card',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'PostCard',
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
      name: 'targetPostCard',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        'b1238c2d-bc9c-53d6-8bee-eb045b9b9086',
      relationTargetObjectMetadataUniversalIdentifier:
        '54b589ca-eeed-4950-a176-358418b85c05',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'fb610de1-db20-5e78-8e4a-7630e57148eb',
      universalSettings: {
        joinColumnName: 'targetPostCardId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    // Reverse relation fields for recipient (5 fields)
    {
      description: 'Recipient Recipient',
      icon: 'IconTimelineEvent',
      isNullable: true,
      label: 'Recipient',
      morphId: '20202020-9a2b-4c3d-a4e5-f6a7b8c9d0e1',
      name: 'targetRecipient',
      objectUniversalIdentifier: '20202020-6736-4337-b5c4-8b39fae325a5',
      relationTargetFieldMetadataUniversalIdentifier:
        '1118dd8a-9781-5254-b625-2d0f05eb46fe',
      relationTargetObjectMetadataUniversalIdentifier:
        'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '1ce06ca1-6e9a-53ce-9888-9152b1b2b628',
      universalSettings: {
        joinColumnName: 'targetRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'Recipient Recipient',
      icon: 'IconFileImport',
      isNullable: true,
      label: 'Recipient',
      morphId: '20202020-f634-435d-ab8d-e1168b375c69',
      name: 'targetRecipient',
      objectUniversalIdentifier: '20202020-bd3d-4c60-8dca-571c71d4447a',
      relationTargetFieldMetadataUniversalIdentifier:
        '15714c1a-d354-5407-8a15-25c117d605f8',
      relationTargetObjectMetadataUniversalIdentifier:
        'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '2081700d-7ce6-5698-a7da-a013feda0eb6',
      universalSettings: {
        joinColumnName: 'targetRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'Recipient Recipient',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'Recipient',
      morphId: '20202020-f635-435d-ab8d-e1168b375c70',
      name: 'targetRecipient',
      objectUniversalIdentifier: '20202020-fff0-4b44-be82-bda313884400',
      relationTargetFieldMetadataUniversalIdentifier:
        '167f6de7-835e-51e1-b751-34055eef6aa5',
      relationTargetObjectMetadataUniversalIdentifier:
        'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: 'a93c479c-6206-5714-94ce-affa6e9886aa',
      universalSettings: {
        joinColumnName: 'targetRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    {
      description: 'Recipient Recipient',
      icon: 'IconCheckbox',
      isNullable: true,
      label: 'Recipient',
      morphId: '20202020-f636-435d-ab8d-e1168b375c71',
      name: 'targetRecipient',
      objectUniversalIdentifier: '20202020-5a9a-44e8-95df-771cd06d0fb1',
      relationTargetFieldMetadataUniversalIdentifier:
        'd0db1844-4fde-5a5a-b037-ebeabd4467af',
      relationTargetObjectMetadataUniversalIdentifier:
        'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      type: FieldType.MORPH_RELATION,
      universalIdentifier: '45752445-c4b6-5e80-8aa1-f5321a838b43',
      universalSettings: {
        joinColumnName: 'targetRecipientId',
        onDelete: RelationOnDeleteAction.SET_NULL,
        relationType: RelationType.MANY_TO_ONE,
      },
    },
    // Field on standard company object
    {
      defaultValue: false,
      description: 'Whether the company can receive postcards',
      icon: 'IconMailbox',
      label: 'Can Receive Postcards',
      name: 'canReceivePostcards',
      objectUniversalIdentifier: '20202020-b374-4779-a561-80086cb2e17f',
      type: FieldType.BOOLEAN,
      universalIdentifier: 'f922fdb8-10a9-4f11-a1d0-992a779f6dff',
    },
  ],
  objects: [
    {
      description: 'A simple root-level object',
      fields: [
        {
          label: 'Title',
          name: 'title',
          type: FieldType.TEXT,
          universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000002',
        },
        {
          label: 'Body',
          name: 'body',
          type: FieldType.TEXT,
          universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000003',
        },
        {
          defaultValue: null,
          description: 'Name',
          icon: 'IconAbc',
          isNullable: true,
          label: 'Name',
          name: 'name',
          type: FieldMetadataType.TEXT,
          universalIdentifier: '10452ca3-30cb-56fa-9e58-73f7b1c9fd65',
        },
        {
          description: 'Root notes tied to the RootNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Timeline Activities',
          name: 'timelineActivities',
          relationTargetFieldMetadataUniversalIdentifier:
            '7f891268-9376-5d00-b8ec-bc32a023154d',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
          type: FieldType.RELATION,
          universalIdentifier: 'e1478d59-c947-5926-af8b-4b2f0f842c91',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Root notes tied to the RootNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Attachments',
          name: 'attachments',
          relationTargetFieldMetadataUniversalIdentifier:
            'd72bb002-9952-5651-983e-649436949113',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
          type: FieldType.RELATION,
          universalIdentifier: '34a6b8e9-0187-57e1-86c1-41bacf1b2479',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Root notes tied to the RootNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Note Targets',
          name: 'noteTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            '61252ad6-2311-5054-ae51-b318dfd5fbd8',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
          type: FieldType.RELATION,
          universalIdentifier: '7a62bbd6-e697-54b0-8c1c-163ac47c0305',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Root notes tied to the RootNote',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Task Targets',
          name: 'taskTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            '2f4f3d69-b78e-5465-9e87-17059959fca8',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
          type: FieldType.RELATION,
          universalIdentifier: '10c1af7e-e541-56bc-b5b3-d0297df3e23d',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      ],
      icon: 'IconNote',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'b0b1b2b3-b4b5-4000-8000-000000000002',
      labelPlural: 'Root notes',
      labelSingular: 'Root note',
      namePlural: 'rootNotes',
      nameSingular: 'rootNote',
      universalIdentifier: 'b0b1b2b3-b4b5-4000-8000-000000000001',
    },
    {
      description: 'Junction object linking post cards to their recipients',
      fields: [
        {
          defaultValue: null,
          icon: 'IconClock',
          isNullable: true,
          label: 'Sent at',
          name: 'sentAt',
          type: FieldType.DATE_TIME,
          universalIdentifier: 'e2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
        },
        {
          defaultValue: null,
          description: 'Name',
          icon: 'IconAbc',
          isNullable: true,
          label: 'Name',
          name: 'name',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'f485cd3a-4c55-5b8f-b926-a83e5e6ba651',
        },
        {
          description: 'Post Card Recipients tied to the PostCardRecipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Timeline Activities',
          name: 'timelineActivities',
          relationTargetFieldMetadataUniversalIdentifier:
            'a865f403-3843-5850-9a60-04e832220954',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
          type: FieldType.RELATION,
          universalIdentifier: '8f95b434-ee92-5c0f-95de-9d489af4d40c',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post Card Recipients tied to the PostCardRecipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Attachments',
          name: 'attachments',
          relationTargetFieldMetadataUniversalIdentifier:
            '501c46b7-7140-59a0-b703-9844bbcb34b9',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
          type: FieldType.RELATION,
          universalIdentifier: '0c20df83-8cef-5cd6-9752-b98fb7780904',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post Card Recipients tied to the PostCardRecipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Note Targets',
          name: 'noteTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            '721418ff-1b53-58ef-8dd7-b58927c085c6',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
          type: FieldType.RELATION,
          universalIdentifier: 'b9642a90-2df5-555b-ab83-23cdce7a4142',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post Card Recipients tied to the PostCardRecipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Task Targets',
          name: 'taskTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            'feeba797-7ebb-5a36-91cd-7279ff92a2b6',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
          type: FieldType.RELATION,
          universalIdentifier: 'd938a2d0-1279-5c48-b758-ac52f9460a76',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      ],
      icon: 'IconLink',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'f485cd3a-4c55-5b8f-b926-a83e5e6ba651',
      labelPlural: 'Post Card Recipients',
      labelSingular: 'Post Card Recipient',
      namePlural: 'postCardRecipients',
      nameSingular: 'postCardRecipient',
      universalIdentifier: 'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
    },
    {
      description: 'A post card object',
      fields: [
        {
          description: "Postcard's content",
          icon: 'IconAbc',
          label: 'Content',
          name: 'content',
          type: FieldType.TEXT,
          universalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
        },
        {
          icon: 'IconUser',
          label: 'Recipient name',
          name: 'recipientName',
          type: FieldType.FULL_NAME,
          universalIdentifier: 'c6aa31f3-da76-4ac6-889f-475e226009ac',
        },
        {
          icon: 'IconHome',
          label: 'Recipient address',
          name: 'recipientAddress',
          type: FieldType.ADDRESS,
          universalIdentifier: '95045777-a0ad-49ec-98f9-22f9fc0c8266',
        },
        {
          defaultValue: "'DRAFT'",
          icon: 'IconSend',
          label: 'Status',
          name: 'status',
          options: [
            {
              color: 'gray',
              id: '1b008e19-1e59-4a07-b187-65a20e547c4e',
              label: 'Draft',
              position: 0,
              value: 'DRAFT',
            },
            {
              color: 'orange',
              id: '452b9d40-889c-4342-9697-98319394db04',
              label: 'Sent',
              position: 1,
              value: 'SENT',
            },
            {
              color: 'green',
              id: 'c2ed0b8c-a3ed-4383-aef9-e0441267bcfe',
              label: 'Delivered',
              position: 2,
              value: 'DELIVERED',
            },
            {
              color: 'orange',
              id: 'c57a5e08-7ef7-49b8-87e6-32d720d22802',
              label: 'Returned',
              position: 3,
              value: 'RETURNED',
            },
            {
              color: 'red',
              id: '5248e3c4-23f8-512d-9bea-5c2df85bf83c',
              label: 'Lost',
              position: 4,
              value: 'LOST',
            },
          ],
          type: FieldType.SELECT,
          universalIdentifier: '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
        },
        {
          defaultValue: null,
          icon: 'IconCheck',
          isNullable: true,
          label: 'Delivered at',
          name: 'deliveredAt',
          type: FieldType.DATE_TIME,
          universalIdentifier: 'e06abe72-5b44-4e7f-93be-afc185a3c433',
        },
        {
          defaultValue: null,
          description: 'Name',
          icon: 'IconAbc',
          isNullable: true,
          label: 'Name',
          name: 'name',
          type: FieldMetadataType.TEXT,
          universalIdentifier: '3e14e30f-8271-5a13-9c1f-ce5edb932325',
        },
        {
          description: 'Post cards tied to the PostCard',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Timeline Activities',
          name: 'timelineActivities',
          relationTargetFieldMetadataUniversalIdentifier:
            '47d21bb5-075f-5ed4-ba89-c0e7322a57cd',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
          type: FieldType.RELATION,
          universalIdentifier: '9e58820c-78d7-539d-807c-d84362e1eab6',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post cards tied to the PostCard',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Attachments',
          name: 'attachments',
          relationTargetFieldMetadataUniversalIdentifier:
            '4d3cf1bd-d87d-5325-8fbc-19f72c252050',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
          type: FieldType.RELATION,
          universalIdentifier: '3f0d38c8-a50f-51c7-bdcb-84a715f4b92d',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post cards tied to the PostCard',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Note Targets',
          name: 'noteTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            'bc1f9abe-e27b-574a-9290-a1c9c8255a6b',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
          type: FieldType.RELATION,
          universalIdentifier: 'def1f10a-847b-574e-a0a2-177caf02129c',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Post cards tied to the PostCard',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Task Targets',
          name: 'taskTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            'fb610de1-db20-5e78-8e4a-7630e57148eb',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
          type: FieldType.RELATION,
          universalIdentifier: 'b1238c2d-bc9c-53d6-8bee-eb045b9b9086',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      ],
      icon: 'IconMail',
      labelIdentifierFieldMetadataUniversalIdentifier:
        '58a0a314-d7ea-4865-9850-7fb84e72f30b',
      labelPlural: 'Post cards',
      labelSingular: 'Post card',
      namePlural: 'postCards',
      nameSingular: 'postCard',
      universalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
    },
    {
      description: 'A person or organization that receives post cards',
      fields: [
        {
          icon: 'IconMail',
          label: 'Email',
          name: 'email',
          type: FieldType.EMAILS,
          universalIdentifier: 'd2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        },
        {
          icon: 'IconHome',
          label: 'Mailing Address',
          name: 'mailingAddress',
          type: FieldType.ADDRESS,
          universalIdentifier: 'd3a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
        },
        {
          defaultValue: null,
          description: 'Name',
          icon: 'IconAbc',
          isNullable: true,
          label: 'Name',
          name: 'name',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'c400ccb8-cd91-5ae1-81e3-2df8b6f2cf53',
        },
        {
          description: 'Recipients tied to the Recipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Timeline Activities',
          name: 'timelineActivities',
          relationTargetFieldMetadataUniversalIdentifier:
            '1ce06ca1-6e9a-53ce-9888-9152b1b2b628',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-6736-4337-b5c4-8b39fae325a5',
          type: FieldType.RELATION,
          universalIdentifier: '1118dd8a-9781-5254-b625-2d0f05eb46fe',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Recipients tied to the Recipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Attachments',
          name: 'attachments',
          relationTargetFieldMetadataUniversalIdentifier:
            '2081700d-7ce6-5698-a7da-a013feda0eb6',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-bd3d-4c60-8dca-571c71d4447a',
          type: FieldType.RELATION,
          universalIdentifier: '15714c1a-d354-5407-8a15-25c117d605f8',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Recipients tied to the Recipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Note Targets',
          name: 'noteTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            'a93c479c-6206-5714-94ce-affa6e9886aa',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-fff0-4b44-be82-bda313884400',
          type: FieldType.RELATION,
          universalIdentifier: '167f6de7-835e-51e1-b751-34055eef6aa5',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
        {
          description: 'Recipients tied to the Recipient',
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
          label: 'Task Targets',
          name: 'taskTargets',
          relationTargetFieldMetadataUniversalIdentifier:
            '45752445-c4b6-5e80-8aa1-f5321a838b43',
          relationTargetObjectMetadataUniversalIdentifier:
            '20202020-5a9a-44e8-95df-771cd06d0fb1',
          type: FieldType.RELATION,
          universalIdentifier: 'd0db1844-4fde-5a5a-b037-ebeabd4467af',
          universalSettings: {
            relationType: RelationType.ONE_TO_MANY,
          },
        },
      ],
      icon: 'IconUser',
      labelIdentifierFieldMetadataUniversalIdentifier:
        'c400ccb8-cd91-5ae1-81e3-2df8b6f2cf53',
      labelPlural: 'Recipients',
      labelSingular: 'Recipient',
      namePlural: 'recipients',
      nameSingular: 'recipient',
      universalIdentifier: 'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    },
  ],
  roles: [
    {
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: true,
      canDestroyAllObjectRecords: false,
      canReadAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canUpdateAllSettings: false,
      description: 'A simple root-level role',
      label: 'Root role',
      universalIdentifier: 'c0c1c2c3-c4c5-4000-8000-000000000001',
      fieldPermissions: [],
      objectPermissions: [],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
      permissionFlagUniversalIdentifiers: [],
    },
    {
      canBeAssignedToAgents: false,
      canBeAssignedToApiKeys: false,
      canBeAssignedToUsers: false,
      canDestroyAllObjectRecords: false,
      canReadAllObjectRecords: false,
      canSoftDeleteAllObjectRecords: false,
      canUpdateAllObjectRecords: false,
      canUpdateAllSettings: false,
      description: 'Default role for function Twenty client',
      fieldPermissions: [
        {
          universalIdentifier: 'dbc86ced-bd2c-5874-93f1-1f72c5111991',
          canReadFieldValue: false,
          canUpdateFieldValue: false,
          fieldUniversalIdentifier: '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
        },
      ],
      label: 'Default function role',
      objectPermissions: [
        {
          universalIdentifier: '99c7c326-04ca-5c8b-ad11-da6c5b819813',
          canDestroyObjectRecords: false,
          canReadObjectRecords: true,
          canSoftDeleteObjectRecords: false,
          canUpdateObjectRecords: true,
          objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
        },
      ],
      rowLevelPermissionPredicateGroups: [],
      rowLevelPermissionPredicates: [],
      permissionFlagUniversalIdentifiers: [SystemPermissionFlag.APPLICATIONS],
      universalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
    },
  ],
  views: [
    {
      fields: [
        {
          fieldMetadataUniversalIdentifier:
            'e2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
          isVisible: true,
          position: 0,
          size: 200,
          universalIdentifier: 'fd959c6f-3465-4a3a-b7ad-3f4004fffc9a',
        },
      ],
      icon: 'IconLink',
      name: 'All Post Card Recipients',
      objectUniversalIdentifier: 'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
      position: 2,
      type: ViewType.TABLE,
      universalIdentifier: 'b1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      fields: [
        {
          fieldMetadataUniversalIdentifier:
            '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          isVisible: true,
          position: 0,
          size: 200,
          universalIdentifier: 'bf1a2b3c-0001-4a7b-8c9d-0e1f2a3b4c5d',
        },
        {
          fieldMetadataUniversalIdentifier:
            '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
          isVisible: true,
          position: 1,
          size: 150,
          universalIdentifier: 'bf1a2b3c-0002-4a7b-8c9d-0e1f2a3b4c5d',
        },
      ],
      icon: 'IconMail',
      name: 'All Post Cards',
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      position: 0,
      type: ViewType.TABLE,
      universalIdentifier: 'b1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      fields: [
        {
          fieldMetadataUniversalIdentifier:
            'd2a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
          isVisible: true,
          position: 0,
          size: 200,
          universalIdentifier: 'bf1a2b3c-0003-4a7b-8c9d-0e1f2a3b4c5d',
        },
        {
          fieldMetadataUniversalIdentifier:
            'd3a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
          isVisible: true,
          position: 1,
          size: 150,
          universalIdentifier: 'bf1a2b3c-0004-4a7b-8c9d-0e1f2a3b4c5d',
        },
      ],
      icon: 'IconUser',
      name: 'All Recipients',
      objectUniversalIdentifier: 'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
      position: 1,
      type: ViewType.TABLE,
      universalIdentifier: 'b1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      fields: [
        {
          fieldMetadataUniversalIdentifier:
            '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          isVisible: true,
          position: 0,
          size: 200,
          universalIdentifier: 'bf1a2b3c-0005-4a7b-8c9d-0e1f2a3b4c5d',
        },
      ],
      groups: [
        {
          fieldValue: 'DRAFT',
          isVisible: true,
          position: 0,
          universalIdentifier: 'e9ed34f1-3c3d-41b1-869b-00aae0033d9c',
        },
        {
          fieldValue: 'SENT',
          isVisible: true,
          position: 1,
          universalIdentifier: '19b1a3c1-53f0-4d32-b072-d645dac98e38',
        },
        {
          fieldValue: 'DELIVERED',
          isVisible: true,
          position: 2,
          universalIdentifier: 'f545cb5a-370d-423f-9b4e-278a9a465bdf',
        },
        {
          fieldValue: 'RETURNED',
          isVisible: true,
          position: 3,
          universalIdentifier: '5d4c6d5f-af53-4cd0-a843-df38915561b2',
        },
        {
          fieldValue: 'LOST',
          isVisible: true,
          position: 4,
          universalIdentifier: '5ebbd7dc-9939-4594-b2a0-519269b4531f',
        },
      ],
      icon: 'IconLayoutKanban',
      mainGroupByFieldMetadataUniversalIdentifier:
        '87b675b8-dd8c-4448-b4ca-20e5a2234a1e',
      name: 'By Status',
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      position: 1,
      type: ViewType.KANBAN,
      universalIdentifier: 'b1a2b3c4-0004-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      calendarFieldMetadataUniversalIdentifier:
        'e06abe72-5b44-4e7f-93be-afc185a3c433',
      calendarLayout: ViewCalendarLayout.MONTH,
      fields: [
        {
          fieldMetadataUniversalIdentifier:
            '58a0a314-d7ea-4865-9850-7fb84e72f30b',
          isVisible: true,
          position: 0,
          size: 200,
          universalIdentifier: 'bf1a2b3c-0006-4a7b-8c9d-0e1f2a3b4c5d',
        },
      ],
      icon: 'IconCalendarEvent',
      name: 'By Delivery Date',
      objectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
      position: 2,
      type: ViewType.CALENDAR,
      universalIdentifier: 'b1a2b3c4-0005-4a7b-8c9d-0e1f2a3b4c5d',
    },
  ],
  viewFields: [
    {
      fieldMetadataUniversalIdentifier: '7b57bd63-5a4c-46ca-9d52-42c8f02d1df6',
      isVisible: true,
      position: 5,
      universalIdentifier: 'cd582d11-ea21-4dc3-b9c1-0298ce3b6b54',
      viewUniversalIdentifier: 'b1a2b3c4-0001-4a7b-8c9d-0e1f2a3b4c5d',
    },
  ],
  navigationMenuItems: [
    {
      type: NavigationMenuItemType.OBJECT,
      position: 2,
      universalIdentifier: 'c1a2b3c4-0003-4a7b-8c9d-0e1f2a3b4c5d',
      targetObjectUniversalIdentifier: 'e1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5e',
    },
    {
      type: NavigationMenuItemType.OBJECT,
      position: 0,
      universalIdentifier: 'e8031eca-d6ea-4a4b-b828-38227dba896a',
      targetObjectUniversalIdentifier: '54b589ca-eeed-4950-a176-358418b85c05',
    },
    {
      type: NavigationMenuItemType.OBJECT,
      position: 1,
      universalIdentifier: 'c1a2b3c4-0002-4a7b-8c9d-0e1f2a3b4c5d',
      targetObjectUniversalIdentifier: 'd1a2b3c4-5e6f-4a7b-8c9d-0e1f2a3b4c5d',
    },
  ],
  logicFunctions: [
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/root.function.mjs',
      handlerName: 'default.config.handler',
      name: 'root-function',
      sourceHandlerPath: 'src/root.function.ts',
      timeoutSeconds: 5,
      httpRouteTriggerSettings: {
        httpMethod: 'GET',
        isAuthRequired: false,
        path: '/root',
      },
      universalIdentifier: 'f0f1f2f3-f4f5-4000-8000-000000000001',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/greeting.function.mjs',
      handlerName: 'default.config.handler',
      name: 'greeting-function',
      sourceHandlerPath: 'src/logic-functions/greeting.function.ts',
      timeoutSeconds: 5,
      httpRouteTriggerSettings: {
        httpMethod: 'GET',
        isAuthRequired: false,
        path: '/greet',
      },
      universalIdentifier: '9d412d9e-2caf-487c-8b66-d1585883dd4e',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/lookup-recipient.function.mjs',
      description: 'Look up a recipient by name to find their details',
      handlerName: 'default.config.handler',
      name: 'lookup-recipient',
      sourceHandlerPath: 'src/logic-functions/lookup-recipient.function.ts',
      timeoutSeconds: 5,
      toolTriggerSettings: {
        inputSchema: {
          type: 'object',
          properties: {
            recipientName: {
              type: 'string',
            },
          },
          required: ['recipientName'],
        },
      },
      universalIdentifier: 'a1b2c3d4-1001-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/enrich-post-cards.function.mjs',
      description: 'Enrich post cards of a company',
      handlerName: 'default.config.handler',
      name: 'enrich-post-cards',
      sourceHandlerPath: 'src/logic-functions/enrich-post-cards.function.ts',
      timeoutSeconds: 5,
      workflowActionTriggerSettings: {
        label: 'Enrich Post Cards',
        icon: 'IconMail',
        inputSchema: [
          {
            type: 'object',
            properties: {
              companyId: {
                type: 'record',
                objectUniversalIdentifier:
                  '20202020-b374-4779-a561-80086cb2e17f',
              },
              postCardIds: {
                type: 'records',
                objectUniversalIdentifier:
                  '54b589ca-eeed-4950-a176-358418b85c05',
              },
            },
          },
        ],
      },
      universalIdentifier: 'a1b2c3d4-ac10-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/on-post-card-created.function.mjs',
      databaseEventTriggerSettings: {
        eventName: 'postCard.created',
      },
      description: 'Triggered when a new post card is created',
      handlerName: 'default.config.handler',
      name: 'on-post-card-created',
      sourceHandlerPath: 'src/logic-functions/on-post-card-created.function.ts',
      timeoutSeconds: 5,
      universalIdentifier: 'a1b2c3d4-db01-4a7b-8c9d-0e1f2a3b4c5d',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/test-function-2.function.mjs',
      handlerName: 'default.config.handler',
      name: 'test-function-2',
      sourceHandlerPath: 'src/logic-functions/test-function-2.function.ts',
      timeoutSeconds: 2,
      cronTriggerSettings: {
        pattern: '0 0 1 1 *',
      },
      universalIdentifier: 'eb3ffc98-88ec-45d4-9b4a-56833b219ccb',
    },
    {
      builtHandlerChecksum: '[checksum]',
      builtHandlerPath: 'src/logic-functions/test-function.function.mjs',
      handlerName: 'default.config.handler',
      name: 'test-function',
      sourceHandlerPath: 'src/logic-functions/test-function.function.ts',
      timeoutSeconds: 2,
      httpRouteTriggerSettings: {
        forwardedRequestHeaders: ['signature'],
        httpMethod: 'GET',
        isAuthRequired: false,
        path: '/post-card/create',
      },
      universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
    },
  ],
};
