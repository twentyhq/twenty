import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = {
  universalIdentifier: '1eadac4e-db9f-4cce-b20b-de75f41e34dc',
  displayName: 'Mailchimp synchronizer',
  description: 'Synchronizes Twenty contacts in Mailchimp',
  icon: "IconMailFast",
  applicationVariables: {
    MAILCHIMP_API_KEY: {
      universalIdentifier: 'f10d4e8a-8055-4eb2-b9ad-efd69d43b1f0',
      isSecret: true,
      description: 'Required to send requests to Mailchimp',
    },
    MAILCHIMP_SERVER_PREFIX: {
      universalIdentifier: '6c8b6ac9-dd45-4f0b-a397-c4a38edccfd9',
      isSecret: false,
      description: 'Required to send requests to Mailchimp (it\'s found in url, e.g. https://us9.admin.mailchimp.com > us9 is prefix)',
    },
    MAILCHIMP_AUDIENCE_ID: {
      universalIdentifier: '5492f06f-bb29-4c93-9436-b4736a396376',
      isSecret: false,
      description: 'Required to send requests to Mailchimp',
    },
    IS_EMAIL_CONSTRAINT: {
      universalIdentifier: '62626c57-470f-4866-be1e-5b4d7ec09f9f',
      isSecret: false,
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_PHONE_CONSTRAINT: {
      universalIdentifier: 'fac8ec5b-dade-46bf-b938-3dfdef0aa298',
      isSecret: false,
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_COMPANY_CONSTRAINT: {
      universalIdentifier: '9ffd8e76-4ab2-42f9-8549-3622a5ae2343',
      isSecret: false,
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    IS_ADDRESS_CONSTRAINT: {
      universalIdentifier: '4b899eb6-517e-4afd-bbf8-88097900ea42',
      isSecret: false,
      value: 'false',
      description:
        'Set to true if you want to add additional constraint (default is false)',
    },
    UPDATE_PERSON: {
      universalIdentifier: '9d753e1e-4408-40ca-b0f0-5c7e8625c2aa',
      isSecret: true,
      value: 'false',
      description: 'Set to true if you want to update record in Mailchimp if it exists',
    },
  },
};

export default config;
