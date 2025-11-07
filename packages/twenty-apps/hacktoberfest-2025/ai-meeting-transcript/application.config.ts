import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '028754f1-3235-43b9-9427-fa6a62dbd473',
  displayName: 'AI Meeting Transcript',
  description:
    'Automatically process meeting transcripts to extract insights, action items, and follow-ups',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: '1359d05c-4947-4673-809f-abd55bede365',
      isSecret: true,
      value: '',
      description: 'Twenty API key',
    },
    TWENTY_API_URL: {
      universalIdentifier: 'dbe83355-b574-445c-92c0-5c2b94a61ddb',
      isSecret: true,
      value: '',
      description: 'Twenty API URL',
    },
    OPENAI_API_KEY: {
      universalIdentifier: '9559470d-15eb-4bc2-9cbc-3bc5c869d1fd',
      isSecret: true,
      value: '',
      description: 'OpenAI API key for transcript analysis',
    },
  },
};

export default config;
