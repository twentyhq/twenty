import { type JSONSchema7 } from 'json-schema';

const STRING: JSONSchema7 = { type: 'string' };
const NUMBER: JSONSchema7 = { type: 'number' };

export const SHARED_VALUE_JSON_SCHEMAS = {
  UuidValue: { type: 'string', format: 'uuid' },
  LinksValue: {
    type: 'object',
    properties: {
      primaryLinkLabel: STRING,
      primaryLinkUrl: { type: 'string', format: 'uri' },
      secondaryLinks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            url: { type: 'string', format: 'uri' },
            label: STRING,
          },
          required: ['url', 'label'],
        },
      },
    },
  },
  CurrencyValue: {
    type: 'object',
    properties: {
      amountMicros: {
        description:
          'Currency amount in micros (1 unit = 1,000,000 micros). Multiply the user-provided amount by 1,000,000 before writing.',
        type: 'number',
      },
      currencyCode: STRING,
    },
  },
  FullNameValue: {
    type: 'object',
    properties: { firstName: STRING, lastName: STRING },
  },
  AddressValue: {
    type: 'object',
    properties: {
      addressStreet1: STRING,
      addressStreet2: STRING,
      addressCity: STRING,
      addressPostcode: STRING,
      addressState: STRING,
      addressCountry: STRING,
      addressLat: NUMBER,
      addressLng: NUMBER,
    },
  },
  EmailsValue: {
    type: 'object',
    properties: {
      primaryEmail: { type: 'string', format: 'email' },
      additionalEmails: {
        type: 'array',
        items: { type: 'string', format: 'email' },
      },
    },
  },
  PhonesValue: {
    type: 'object',
    properties: {
      primaryPhoneNumber: STRING,
      primaryPhoneCountryCode: STRING,
      primaryPhoneCallingCode: STRING,
      additionalPhones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            number: STRING,
            countryCode: STRING,
            callingCode: STRING,
          },
          required: ['number'],
        },
      },
    },
  },
  RichTextValue: {
    type: 'object',
    properties: { markdown: STRING, blocknote: STRING },
  },
} satisfies Record<string, JSONSchema7>;
