import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '1eadac4e-db9f-4cce-b20b-de75f41e34dc',
  displayName: 'Mailchimp synchronizer',
  description: '',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: '0af17af3-66b8-40cf-b6e2-6a29a1da5464',
      isSecret: true,
      value: '',
      description: 'Required to send requests to Twenty',
    },
    TWENTY_API_URL: {
      universalIdentifier: '12949c1c-aed7-4a9f-bd06-9fd15f0bfa63',
      value: '',
      description: 'Optional, defaults to cloud API URL',
    },
    MAILCHIMP_API_KEY: {
      universalIdentifier: 'f10d4e8a-8055-4eb2-b9ad-efd69d43b1f0',
      isSecret: true,
      value: '',
      description: 'Required to send requests to Mailchimp',
    },
    MAILCHIMP_URL: {
      universalIdentifier: '6c8b6ac9-dd45-4f0b-a397-c4a38edccfd9',
      value: '',
      description: 'Required to send requests to Mailchimp',
    },
    IS_EMAIL_CONSTRAINT: {
      universalIdentifier: '62626c57-470f-4866-be1e-5b4d7ec09f9f',
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_PHONE_CONSTRAINT: {
      universalIdentifier: 'fac8ec5b-dade-46bf-b938-3dfdef0aa298',
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_COMPANY_CONSTRAINT: {
      universalIdentifier: '9ffd8e76-4ab2-42f9-8549-3622a5ae2343',
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_ADDRESS_CONSTRAINT: {
      universalIdentifier: '4b899eb6-517e-4afd-bbf8-88097900ea42',
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    UPDATE_PERSON: {
      universalIdentifier: '9d753e1e-4408-40ca-b0f0-5c7e8625c2aa',
      value: 'false',
      description: 'Set to true if you want to update record if it exists',
    },
    MAILCHIMP_AUDIENCE_ID: {
      universalIdentifier: '5492f06f-bb29-4c93-9436-b4736a396376',
      value: '',
      description: 'Required to send requests to Mailchimp',
    },
  },
};

export default config;
