import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: 'f15a0c72-f7b4-4d20-9e97-ade1122d4bd7',
  displayName: 'Meeting Transcript',
  description: 'AI Meeting Transcript Integration for Hacktoberfest',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'c5a4310b-6744-4fda-ad0a-d1c6fea0539b',
      isSecret: true,
      value: '',
      description:
        'API key for the Twenty CRM instance (used for authentication).',
    },
    AI_PROVIDER_API_KEY: {
      universalIdentifier: '7b0f965e-0192-41b5-b390-45a7e5a761b8',
      isSecret: true,
      value: '',
      description:
        'API key for authenticating with the OpenAI-compatible service (supports OpenAI, Groq, and other providers).',
    },
    TWENTY_API_URL: {
      universalIdentifier: '84311303-1220-440c-a4fb-0be2d74d267b',
      isSecret: false,
      value: 'https://unpaid-interns.twenty.com',
      description:
        'The base URL for the Twenty CRM server (e.g., https://your-instance.twenty.com).',
    },
    WEBHOOK_SECRET_TOKEN: {
      universalIdentifier: '187c39c9-8e2a-4086-94b3-59935d4e1a93',
      isSecret: true,
      value: '',
      description:
        'Secret token used to authenticate incoming webhook requests.',
    },
    AI_PROVIDER_API_BASE_URL: {
      universalIdentifier: '15974ed8-4efb-4ebc-9f53-5b0b36183fc4',
      isSecret: false,
      value: 'https://api.openai.com/v1',
      description:
        'Base URL for OpenAI-compatible API. Defaults to OpenAI, but can be changed to use Groq (https://api.groq.com/openai/v1) or other providers.',
    },
  },
};

export default config;
