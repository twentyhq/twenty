import { defineApplication, FieldType } from 'twenty-sdk/define';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from './src/roles/default-function.role';

export default defineApplication({
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Rich App',
  description: 'A simple rich app',
  applicationVariables: {
    // Legacy format (no `type`/`options`) — kept to verify the typed-variable
    // change is backward compatible: untyped variables must still default to
    // TEXT and keep working exactly as before.
    DEFAULT_RECIPIENT_NAME: {
      universalIdentifier: '19e94e59-d4fe-4251-8981-b96d0a9f74de',
      description: 'Default recipient name for postcards',
      value: 'Alex Karp',
      isSecret: false,
    },

    // One example per supported variable type. Values are declared with their
    // native JS type; the serialization layer converts them to the encrypted
    // string storage, and the settings UI renders the matching input.
    GREETING_TEXT: {
      universalIdentifier: 'ad19edc5-4cc5-4003-a996-aef53a5c8de0',
      description: 'Free text shown on the postcard',
      type: FieldType.TEXT,
      value: 'Hello from Rich App',
    },
    ENABLE_TRACKING: {
      universalIdentifier: 'b9c58bb2-58c3-4c6c-9877-498ea6c03fde',
      description: 'Toggle delivery tracking',
      type: FieldType.BOOLEAN,
      value: true,
    },
    MAX_POSTCARDS: {
      universalIdentifier: '5f4497e4-9030-4085-85eb-2c48b8d53713',
      description: 'Maximum postcards per batch',
      type: FieldType.NUMBER,
      value: 10,
    },
    DISCOUNT_RATE: {
      universalIdentifier: 'd32f810f-06bb-4d29-b0ee-1dc4228f7cb8',
      description: 'Bulk discount rate applied at checkout',
      type: FieldType.NUMERIC,
      value: 2.5,
    },
    CAMPAIGN_START_DATE: {
      universalIdentifier: '5aa4fcec-e8a3-4bc1-9c7f-762e1f9dfb40',
      description: 'Date the campaign starts',
      type: FieldType.DATE,
      value: '2026-01-01',
    },
    CAMPAIGN_START_AT: {
      universalIdentifier: '273d0cfd-d6ab-4148-8816-c4a5d4b1d600',
      description: 'Exact moment the campaign starts',
      type: FieldType.DATE_TIME,
      value: '2026-01-01T09:00:00.000Z',
    },
    DEFAULT_REGION: {
      universalIdentifier: '76c5c321-b6b6-46eb-b4fc-f9f04bb04227',
      description: 'Default shipping region',
      type: FieldType.SELECT,
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
      type: FieldType.MULTI_SELECT,
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
      type: FieldType.ARRAY,
      value: ['vip', 'returning'],
    },
    PROVIDER_CONFIG: {
      universalIdentifier: '183d5285-c70c-4f29-96e0-c68659fbe5ae',
      description: 'Raw JSON configuration for the printing provider',
      type: FieldType.RAW_JSON,
      value: { retries: 3, timeoutMs: 5000 },
    },
    WELCOME_MESSAGE: {
      universalIdentifier: '25a66ff5-8458-498e-9e7e-33ea458a6f3c',
      description: 'Rich text welcome message',
      type: FieldType.RICH_TEXT,
      value: { blocknote: null, markdown: 'Welcome to **Rich App**!' },
    },
  },
  serverVariables: {
    // Legacy format (no `type`) — defaults to TEXT, back-compat check.
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
    // Typed server variables — type/options are supported server-side too.
    POSTCARD_DELIVERY_SPEED: {
      description: 'Delivery speed requested from the provider',
      type: FieldType.SELECT,
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Express', value: 'express' },
      ],
      isSecret: false,
      isRequired: true,
    },
    POSTCARD_DAILY_LIMIT: {
      description: 'Maximum postcards the provider will accept per day',
      type: FieldType.NUMBER,
      isSecret: false,
      isRequired: false,
    },
  },
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
});
